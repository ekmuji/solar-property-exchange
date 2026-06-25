import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.module';
import { CreateWarehouseDto, SearchWarehousesDto } from './dto/property.dto';

@Injectable()
export class WarehousesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Marketplace search. When lat/lng are given, runs a PostGIS ST_DWithin
   * radius query (see prisma/postgis.sql) and joins back to Prisma for the
   * full relational shape; otherwise falls back to a plain paginated list.
   * All other filters (solar capacity, EV chargers, internal price, unit/
   * share availability) are applied as a Prisma `where` on top.
   */
  async search(query: SearchWarehousesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    let idsInRadius: string[] | null = null;
    if (query.lat != null && query.lng != null) {
      const radiusMeters = (query.radiusMiles ?? 50) * 1609.34;
      const rows = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM warehouses
        WHERE ST_DWithin(geog, ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography, ${radiusMeters})
        ORDER BY ST_Distance(geog, ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography) ASC
      `;
      idsInRadius = rows.map((r) => r.id);
      if (idsInRadius.length === 0) return { data: [], total: 0, page, limit };
    }

    const where: any = {
      ...(idsInRadius ? { id: { in: idsInRadius } } : {}),
      ...(query.minSolarCapacityKw != null
        ? { solarAsset: { capacityKw: { gte: query.minSolarCapacityKw } } }
        : {}),
      ...(query.onlyWithAvailableUnits === 'true' ? { units: { some: { status: 'AVAILABLE' } } } : {}),
      ...(query.onlyWithEnergyShares === 'true' ? { energyShares: { some: { ownerId: null } } } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        include: {
          units: true,
          solarAsset: true,
          evChargers: true,
          energyShares: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        // Preserve radius ordering when we have one, else newest first.
        orderBy: idsInRadius ? undefined : { createdAt: 'desc' },
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    // Apply the remaining filters that don't map cleanly to Prisma `where`
    // (derived/aggregate values) in memory — fine at marketplace scale,
    // move to a materialized view if listing volume grows.
    const filtered = data.filter((w) => {
      if (query.minEvChargers != null && w.evChargers.length < query.minEvChargers) return false;
      if (query.maxInternalPricePerKwh != null) {
        const cheapestShare = w.energyShares[0]?.internalRatePerKwh;
        if (cheapestShare != null && Number(cheapestShare) > query.maxInternalPricePerKwh) return false;
      }
      return true;
    });

    return { data: filtered, total, page, limit };
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        units: true,
        solarAsset: { include: { productionHistory: { orderBy: { date: 'asc' }, take: 90 } } },
        evChargers: true,
        energyShares: { include: { owner: { select: { id: true, name: true } } } },
        auctions: { where: { status: { in: ['LIVE', 'SCHEDULED'] } } },
        owner: { select: { id: true, name: true } },
      },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async create(ownerId: string, dto: CreateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.create({
      data: { ...dto, ownerId },
    });
    // geog column is populated by the DB trigger in prisma/postgis.sql
    await this.redis.invalidate('warehouses:search:*');
    return warehouse;
  }
}
