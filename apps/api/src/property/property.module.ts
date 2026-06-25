import { Module } from '@nestjs/common';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';

@Module({
  controllers: [WarehousesController, UnitsController],
  providers: [WarehousesService, UnitsService],
  exports: [WarehousesService, UnitsService],
})
export class PropertyModule {}
