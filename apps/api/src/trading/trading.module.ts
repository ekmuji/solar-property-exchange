import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards, Module } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/auth.module';
import { User } from '@prisma/client';
import { TradingService } from './trading.service';
import { TradingGateway } from './trading.gateway';
import { PlaceOrderDto } from './dto/trading.dto';

@Controller('trading')
export class TradingController {
  constructor(
    private tradingService: TradingService,
    private gateway: TradingGateway,
  ) {}

  @Get('order-book')
  orderBook(@Query('warehouseId') warehouseId?: string) {
    return this.tradingService.orderBook(warehouseId);
  }

  @Post('orders')
  @UseGuards(ClerkAuthGuard)
  async placeOrder(@CurrentUser() user: User, @Body() dto: PlaceOrderDto) {
    const result = await this.tradingService.placeOrder(user.id, dto);

    if (result.fills.length > 0) {
      this.gateway.broadcastTrade(dto.warehouseId, result);
    }
    const book = await this.tradingService.orderBook(dto.warehouseId);
    this.gateway.broadcastOrderBook(dto.warehouseId, book);

    return result;
  }

  @Delete('orders/:id')
  @UseGuards(ClerkAuthGuard)
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.tradingService.cancel(id, user.id);
  }
}

@Module({
  controllers: [TradingController],
  providers: [TradingService, TradingGateway],
  exports: [TradingService, TradingGateway],
})
export class TradingModule {}
