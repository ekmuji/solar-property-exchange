import { Body, Controller, Get, Param, Post, Query, UseGuards, Module } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/auth.module';
import { User } from '@prisma/client';
import { SolarAssetsService } from './solar-assets.service';
import { EnergySharesService } from './energy-shares.service';
import { PurchaseShareDto, RecordProductionDto } from './dto/energy.dto';

@Controller('warehouses/:warehouseId/solar')
export class SolarAssetsController {
  constructor(private solarAssetsService: SolarAssetsService) {}

  @Get()
  get(@Param('warehouseId') warehouseId: string) {
    return this.solarAssetsService.getForWarehouse(warehouseId);
  }

  @Get('forecast')
  forecast(@Param('warehouseId') warehouseId: string, @Query('days') days?: string) {
    return this.solarAssetsService.forecast(warehouseId, days ? Number(days) : 7);
  }

  @Post('production')
  @UseGuards(ClerkAuthGuard)
  record(@Param('warehouseId') warehouseId: string, @Body() dto: RecordProductionDto) {
    return this.solarAssetsService.recordProduction(warehouseId, dto);
  }
}

@Controller('warehouses/:warehouseId/energy-shares')
export class EnergySharesController {
  constructor(private energySharesService: EnergySharesService) {}

  @Get()
  list(@Param('warehouseId') warehouseId: string) {
    return this.energySharesService.listForWarehouse(warehouseId);
  }

  @Post('purchase')
  @UseGuards(ClerkAuthGuard)
  purchase(@Param('warehouseId') warehouseId: string, @CurrentUser() user: User, @Body() dto: PurchaseShareDto) {
    return this.energySharesService.purchase(warehouseId, user.id, dto);
  }
}

@Module({
  controllers: [SolarAssetsController, EnergySharesController],
  providers: [SolarAssetsService, EnergySharesService],
  exports: [SolarAssetsService, EnergySharesService],
})
export class EnergyModule {}
