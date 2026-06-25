import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TradeSide, TradeStatus } from '@prisma/client';
import { PlaceOrderDto } from './dto/trading.dto';

export interface Fill {
  counterpartyOrderId: string;
  quantityKwh: number;
  pricePerKwh: number;
}

@Injectable()
export class TradingService {
  constructor(private prisma: PrismaService) {}

  async orderBook(warehouseId?: string) {
    const where: any = {
      status: { in: [TradeStatus.OPEN, TradeStatus.PARTIALLY_FILLED] },
      ...(warehouseId ? { warehouseId } : {}),
    };

    const [buys, sells] = await Promise.all([
      this.prisma.energyTrade.findMany({
        where: { ...where, side: TradeSide.BUY },
        orderBy: [{ pricePerKwh: 'desc' }, { timestamp: 'asc' }],
        include: { user: { select: { id: true, name: true } } },
      }),
      this.prisma.energyTrade.findMany({
        where: { ...where, side: TradeSide.SELL },
        orderBy: [{ pricePerKwh: 'asc' }, { timestamp: 'asc' }],
        include: { user: { select: { id: true, name: true } } },
      }),
    ]);

    return { buys, sells };
  }

  /**
   * Price-time priority matching. A BUY only matches SELL orders priced at
   * or below its bid; a SELL only matches BUY orders priced at or above its
   * ask. Execution price is the midpoint of the two crossing prices — this
   * matches the PRD's worked example (0.12 ask / 0.15 bid -> 0.135 fill).
   * Partial fills are supported: any unmatched remainder rests on the book.
   */
  async placeOrder(userId: string, dto: PlaceOrderDto): Promise<{ order: any; fills: Fill[] }> {
    const oppositeSide = dto.side === 'BUY' ? TradeSide.SELL : TradeSide.BUY;

    return this.prisma.$transaction(async (tx) => {
      const candidates = await tx.energyTrade.findMany({
        where: {
          side: oppositeSide,
          status: { in: [TradeStatus.OPEN, TradeStatus.PARTIALLY_FILLED] },
          ...(dto.warehouseId ? { warehouseId: dto.warehouseId } : {}),
          pricePerKwh: dto.side === 'BUY' ? { lte: dto.pricePerKwh } : { gte: dto.pricePerKwh },
        },
        orderBy:
          dto.side === 'BUY'
            ? [{ pricePerKwh: 'asc' }, { timestamp: 'asc' }] // cheapest sellers first
            : [{ pricePerKwh: 'desc' }, { timestamp: 'asc' }], // highest bidders first
      });

      let remaining = dto.quantityKwh;
      const fills: Fill[] = [];
      let lastCounterparty: string | null = null;

      for (const candidate of candidates) {
        if (remaining <= 0) break;
        const available = candidate.quantityKwh - candidate.filledKwh;
        if (available <= 0) continue;

        const fillQty = Math.min(remaining, available);
        const execPrice = (Number(candidate.pricePerKwh) + dto.pricePerKwh) / 2;
        const candidateFilled = candidate.filledKwh + fillQty;

        await tx.energyTrade.update({
          where: { id: candidate.id },
          data: {
            filledKwh: candidateFilled,
            status: candidateFilled >= candidate.quantityKwh ? TradeStatus.FILLED : TradeStatus.PARTIALLY_FILLED,
            counterpartyId: userId,
          },
        });

        remaining -= fillQty;
        lastCounterparty = candidate.userId;
        fills.push({ counterpartyOrderId: candidate.id, quantityKwh: fillQty, pricePerKwh: execPrice });
      }

      const filledKwh = dto.quantityKwh - remaining;
      const order = await tx.energyTrade.create({
        data: {
          userId,
          side: dto.side,
          quantityKwh: dto.quantityKwh,
          filledKwh,
          pricePerKwh: dto.pricePerKwh,
          warehouseId: dto.warehouseId,
          counterpartyId: lastCounterparty,
          status:
            remaining <= 0 ? TradeStatus.FILLED : filledKwh > 0 ? TradeStatus.PARTIALLY_FILLED : TradeStatus.OPEN,
        },
      });

      return { order, fills };
    });
  }

  cancel(orderId: string, userId: string) {
    return this.prisma.energyTrade.updateMany({
      where: { id: orderId, userId, status: { in: [TradeStatus.OPEN, TradeStatus.PARTIALLY_FILLED] } },
      data: { status: TradeStatus.CANCELLED },
    });
  }
}
