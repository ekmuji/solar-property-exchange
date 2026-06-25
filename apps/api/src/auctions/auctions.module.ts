import { Body, Controller, Get, Param, Post, Query, UseGuards, Module } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CurrentUser } from '../auth/auth.module';
import { User } from '@prisma/client';
import { AuctionsService } from './auctions.service';
import { AuctionsGateway } from './auctions.gateway';
import { CreateAuctionDto, PlaceBidDto } from './dto/auctions.dto';

@Controller('auctions')
export class AuctionsController {
  constructor(private auctionsService: AuctionsService) {}

  @Get()
  listLive(@Query('warehouseId') warehouseId?: string) {
    return this.auctionsService.listLive(warehouseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auctionsService.findOne(id);
  }

  @Post(':id/bids')
  @UseGuards(ClerkAuthGuard)
  placeBid(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: PlaceBidDto) {
    return this.auctionsService.placeBid(id, user.id, dto);
  }

  @Post(':id/close')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  close(@Param('id') id: string) {
    return this.auctionsService.close(id);
  }
}

@Controller('warehouses/:warehouseId/auctions')
export class WarehouseAuctionsController {
  constructor(private auctionsService: AuctionsService) {}

  @Post()
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  create(@Param('warehouseId') warehouseId: string, @Body() dto: CreateAuctionDto) {
    return this.auctionsService.create(warehouseId, dto);
  }
}

@Module({
  controllers: [AuctionsController, WarehouseAuctionsController],
  providers: [AuctionsService, AuctionsGateway],
  exports: [AuctionsService, AuctionsGateway],
})
export class AuctionsModule {}
