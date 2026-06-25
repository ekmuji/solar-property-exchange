import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.module';
import { CreateUnitDto } from './dto/property.dto';

@Injectable()
export class UnitsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(warehouseId: string, dto: CreateUnitDto) {
    const unit = await this.prisma.warehouseUnit.create({
      data: {
        warehouseId,
        unitNumber: dto.unitNumber,
        sqft: dto.sqft,
        monthlyRent: dto.monthlyRent,
        availableDate: dto.availableDate ? new Date(dto.availableDate) : new Date(),
        status: UnitStatus.AVAILABLE,
      },
    });
    await this.prisma.warehouse.update({
      where: { id: warehouseId },
      data: { totalUnits: { increment: 1 } },
    });
    await this.redis.invalidate('warehouses:search:*');
    return unit;
  }

  /**
   * "Availability Engine": flips a unit's status. No separate publish step —
   * the marketplace search (WarehousesService.search) always reads the live
   * `status` column, so a unit set back to AVAILABLE here shows up in every
   * subsequent search response immediately.
   */
  async setStatus(unitId: string, status: UnitStatus, tenantId?: string | null) {
    const unit = await this.prisma.warehouseUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException('Unit not found');

    const updated = await this.prisma.warehouseUnit.update({
      where: { id: unitId },
      data: {
        status,
        tenantId: status === UnitStatus.AVAILABLE ? null : (tenantId ?? unit.tenantId),
        availableDate: status === UnitStatus.AVAILABLE ? new Date() : unit.availableDate,
      },
    });

    await this.redis.invalidate('warehouses:search:*');
    return updated;
  }

  /** Convenience wrapper for "unit becomes vacant" -> Occupied/Leased -> Available. */
  release(unitId: string) {
    return this.setStatus(unitId, UnitStatus.AVAILABLE, null);
  }

  lease(unitId: string, tenantId: string) {
    return this.setStatus(unitId, UnitStatus.LEASED, tenantId);
  }
}
