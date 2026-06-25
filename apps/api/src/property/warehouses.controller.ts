import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';
import { CurrentUser } from '../auth/auth.module';
import { User } from '@prisma/client';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, SearchWarehousesDto } from './dto/property.dto';

@Controller('warehouses')
export class WarehousesController {
  constructor(private warehousesService: WarehousesService) {}

  // Public marketplace search — no auth required, matches "Find me warehouses
  // within 50 miles with units available, solar shares for sale, EV charging
  // under £0.15/kWh" from the PRD.
  @Get()
  search(@Query() query: SearchWarehousesDto) {
    return this.warehousesService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(id);
  }

  @Post()
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  create(@CurrentUser() user: User, @Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(user.id, dto);
  }
}
