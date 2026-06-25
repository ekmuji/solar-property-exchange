import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordProductionDto } from './dto/energy.dto';

@Injectable()
export class SolarAssetsService {
  constructor(private prisma: PrismaService) {}

  async getForWarehouse(warehouseId: string) {
    const asset = await this.prisma.solarAsset.findUnique({
      where: { warehouseId },
      include: { productionHistory: { orderBy: { date: 'asc' } } },
    });
    if (!asset) throw new NotFoundException('No solar asset on this warehouse');
    return asset;
  }

  async recordProduction(warehouseId: string, dto: RecordProductionDto) {
    const asset = await this.prisma.solarAsset.findUnique({ where: { warehouseId } });
    if (!asset) throw new NotFoundException('No solar asset on this warehouse');

    const date = dto.date ? new Date(dto.date) : new Date();
    const record = await this.prisma.productionRecord.upsert({
      where: { solarAssetId_date: { solarAssetId: asset.id, date } },
      update: { generatedKwh: dto.generatedKwh },
      create: { solarAssetId: asset.id, date, generatedKwh: dto.generatedKwh },
    });

    await this.prisma.solarAsset.update({
      where: { id: asset.id },
      data: { currentProductionKw: dto.generatedKwh / 24 }, // rough instantaneous estimate
    });

    return record;
  }

  /**
   * TODO: AI Layer — Solar Production Prediction (see PRD "AI Layer").
   * Wire a real model here: inputs are weather (OpenWeather/Meteostat),
   * roof size + orientation (from the floorplan upload), and location
   * (PVGIS/NREL-equivalent irradiance data). For now this returns a naive
   * forecast based on the trailing 30-day average so the frontend chart has
   * something real to render against.
   */
  async forecast(warehouseId: string, days = 7) {
    const asset = await this.getForWarehouse(warehouseId);
    const recent = asset.productionHistory.slice(-30);
    const avg = recent.length ? recent.reduce((s, r) => s + r.generatedKwh, 0) / recent.length : 0;

    return Array.from({ length: days }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return { date: date.toISOString().slice(0, 10), forecastKwh: Math.round(avg) };
    });
  }
}
