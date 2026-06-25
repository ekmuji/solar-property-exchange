import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.module';
import { PurchaseShareDto } from './dto/energy.dto';

@Injectable()
export class EnergySharesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /** Sum of every allocated + reserved share percentage for a warehouse. */
  async allocatedPercentage(warehouseId: string): Promise<number> {
    const shares = await this.prisma.energyShare.findMany({ where: { warehouseId } });
    return shares.reduce((sum, s) => sum + s.sharePercentage, 0);
  }

  async availablePercentage(warehouseId: string): Promise<number> {
    return 100 - (await this.allocatedPercentage(warehouseId));
  }

  /**
   * Buys a fresh slice of a warehouse's energy production. Mirrors the PRD
   * example: a 1,000,000 kWh/year warehouse split into shares — buying 15%
   * entitles the buyer to 150,000 kWh/year at the warehouse's internal rate.
   */
  async purchase(warehouseId: string, buyerId: string, dto: PurchaseShareDto) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
      include: { solarAsset: true },
    });
    if (!warehouse?.solarAsset) throw new NotFoundException('Warehouse or solar asset not found');

    const available = await this.availablePercentage(warehouseId);
    if (dto.sharePercentage > available) {
      throw new BadRequestException(`Only ${available.toFixed(2)}% of this warehouse's production remains unallocated`);
    }

    const annualKwh = Math.round(warehouse.solarAsset.annualGenerationKwh * (dto.sharePercentage / 100));

    const share = await this.prisma.energyShare.create({
      data: {
        warehouseId,
        ownerId: buyerId,
        sharePercentage: dto.sharePercentage,
        annualKwh,
        purchasePrice: dto.purchasePrice,
      },
    });

    await this.redis.invalidate('warehouses:search:*');
    return share;
  }

  async listForWarehouse(warehouseId: string) {
    const shares = await this.prisma.energyShare.findMany({
      where: { warehouseId },
      include: { owner: { select: { id: true, name: true } } },
    });
    const available = await this.availablePercentage(warehouseId);
    return { shares, availablePercentage: available };
  }
}
