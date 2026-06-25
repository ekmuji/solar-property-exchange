import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { UnitStatus } from '@prisma/client';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/property.dto';

class UpdateUnitStatusDto {
  @IsIn(['AVAILABLE', 'RESERVED', 'LEASED', 'AUCTIONING', 'SOLD'])
  status: UnitStatus;

  @IsOptional() @IsString()
  tenantId?: string;
}

@Controller('warehouses/:warehouseId/units')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class UnitsController {
  constructor(private unitsService: UnitsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@Param('warehouseId') warehouseId: string, @Body() dto: CreateUnitDto) {
    return this.unitsService.create(warehouseId, dto);
  }

  @Patch(':unitId/status')
  @Roles('OWNER', 'ADMIN')
  updateStatus(@Param('unitId') unitId: string, @Body() dto: UpdateUnitStatusDto) {
    return this.unitsService.setStatus(unitId, dto.status, dto.tenantId);
  }
}
