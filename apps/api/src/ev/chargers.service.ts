import { Injectable, NotFoundException } from '@nestjs/common';
import { ChargerStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChargerDto } from './dto/ev.dto';

@Injectable()
export class ChargersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Driver-facing discovery view for a site: live availability per charger,
   * plus the site's current solar mix (used to show "83% solar / 17% grid"
   * the way the PRD's EV Driver View does).
   */
  async discover(warehouseId: string) {
    const [chargers, solarAsset] = await Promise.all([
      this.prisma.evCharger.findMany({ where: { warehouseId }, orderBy: { label: 'asc' } }),
      this.prisma.solarAsset.findUnique({ where: { warehouseId } }),
    ]);

    const totalChargerDemandKw = chargers
      .filter((c) => c.status === ChargerStatus.OCCUPIED)
      .reduce((sum, c) => sum + c.powerKw, 0);

    const solarKw = solarAsset?.currentProductionKw ?? 0;
    const solarPercentage = totalChargerDemandKw > 0 ? Math.min(100, Math.round((solarKw / totalChargerDemandKw) * 100)) : 100;

    return {
      chargers,
      availableCount: chargers.filter((c) => c.status === ChargerStatus.AVAILABLE).length,
      solarPercentage,
      gridPercentage: 100 - solarPercentage,
    };
  }

  async create(warehouseId: string, dto: CreateChargerDto) {
    return this.prisma.evCharger.create({
      data: { warehouseId, ...dto } as any,
    });
  }

  async setStatus(chargerId: string, status: ChargerStatus) {
    const charger = await this.prisma.evCharger.findUnique({ where: { id: chargerId } });
    if (!charger) throw new NotFoundException('Charger not found');
    return this.prisma.evCharger.update({ where: { id: chargerId }, data: { status } });
  }
}
