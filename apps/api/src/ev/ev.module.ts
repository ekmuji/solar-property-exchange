import { Body, Controller, Get, Param, Post, UseGuards, Module } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CurrentUser } from '../auth/auth.module';
import { User } from '@prisma/client';
import { ChargersService } from './chargers.service';
import { SessionsService } from './sessions.service';
import { EvGateway } from './ev.gateway';
import { ReserveChargerDto, CompleteSessionDto, CreateChargerDto } from './dto/ev.dto';

@Controller('warehouses/:warehouseId/chargers')
export class ChargersController {
  constructor(private chargersService: ChargersService) {}

  @Get()
  discover(@Param('warehouseId') warehouseId: string) {
    return this.chargersService.discover(warehouseId);
  }

  @Post()
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  create(@Param('warehouseId') warehouseId: string, @Body() dto: CreateChargerDto) {
    return this.chargersService.create(warehouseId, dto);
  }
}

@Controller('chargers/:chargerId/sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post('reserve')
  @UseGuards(ClerkAuthGuard)
  reserve(@Param('chargerId') chargerId: string, @CurrentUser() user: User, @Body() dto: ReserveChargerDto) {
    return this.sessionsService.reserve(chargerId, user.id, dto);
  }
}

@Controller('sessions')
export class SessionsActionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post(':id/start')
  @UseGuards(ClerkAuthGuard)
  start(@Param('id') id: string) {
    return this.sessionsService.start(id);
  }

  @Post(':id/complete')
  @UseGuards(ClerkAuthGuard)
  complete(@Param('id') id: string, @Body() dto: CompleteSessionDto) {
    return this.sessionsService.complete(id, dto);
  }

  @Get('me/history')
  @UseGuards(ClerkAuthGuard)
  history(@CurrentUser() user: User) {
    return this.sessionsService.history(user.id);
  }
}

@Module({
  controllers: [ChargersController, SessionsController, SessionsActionsController],
  providers: [ChargersService, SessionsService, EvGateway],
  exports: [ChargersService, SessionsService, EvGateway],
})
export class EvModule {}
