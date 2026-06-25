import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionsGateway } from './auctions.gateway';
import { CreateAuctionDto, PlaceBidDto } from './dto/auctions.dto';

@Injectable()
export class AuctionsService {
  private readonly logger = new Logger('AuctionsService');

  constructor(
    private prisma: PrismaService,
    private gateway: AuctionsGateway,
  ) {}

  async create(warehouseId: string, dto: CreateAuctionDto) {
    return this.prisma.auction.create({
      data: {
        warehouseId,
        energyShareId: dto.energyShareId,
        sharePercentage: dto.sharePercentage,
        reservePrice: dto.reservePrice,
        currentPrice: dto.reservePrice,
        endDate: new Date(dto.endDate),
        status: AuctionStatus.LIVE,
      },
    });
  }

  async findOne(id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        warehouse: { select: { id: true, name: true, address: true } },
        bids: { orderBy: { amount: 'desc' }, include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!auction) throw new NotFoundException('Auction not found');
    return auction;
  }

  async listLive(warehouseId?: string) {
    return this.prisma.auction.findMany({
      where: { status: AuctionStatus.LIVE, ...(warehouseId ? { warehouseId } : {}) },
      include: { warehouse: { select: { id: true, name: true } }, bids: { orderBy: { amount: 'desc' }, take: 1 } },
      orderBy: { endDate: 'asc' },
    });
  }

  /**
   * Validates the bid beats the current highest bid and the auction is
   * still live, then persists it and bumps `currentPrice`. Broadcasts the
   * new highest bid to every client subscribed to this auction over the
   * `/auctions` WebSocket namespace.
   */
  async placeBid(auctionId: string, userId: string, dto: PlaceBidDto) {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.status !== AuctionStatus.LIVE) throw new BadRequestException('Auction is not live');
    if (new Date() > auction.endDate) throw new BadRequestException('Auction has already ended');
    if (dto.amount <= Number(auction.currentPrice)) {
      throw new BadRequestException(`Bid must exceed the current highest bid of £${auction.currentPrice}`);
    }

    const [bid] = await this.prisma.$transaction([
      this.prisma.bid.create({ data: { auctionId, userId, amount: dto.amount } }),
      this.prisma.auction.update({ where: { id: auctionId }, data: { currentPrice: dto.amount } }),
    ]);

    const bidder = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    this.gateway.broadcastNewBid(auctionId, {
      auctionId,
      amount: dto.amount,
      bidderName: bidder?.name,
      currentPrice: dto.amount,
      timestamp: bid.timestamp,
    });

    return bid;
  }

  /**
   * Closes an auction: marks the highest bid as the winner, converts it
   * into an EnergyShare for the winning bidder, flips the auction's unit
   * status if one was attached, and broadcasts `auction_ended`.
   */
  async close(auctionId: string) {
    const auction = await this.findOne(auctionId);
    if (auction.status !== AuctionStatus.LIVE) return auction;

    const winningBid = auction.bids[0]; // already ordered by amount desc

    await this.prisma.$transaction(async (tx) => {
      await tx.auction.update({
        where: { id: auctionId },
        data: { status: AuctionStatus.ENDED, winningBidId: winningBid?.id },
      });

      if (winningBid) {
        await tx.energyShare.create({
          data: {
            warehouseId: auction.warehouseId,
            ownerId: winningBid.userId,
            sharePercentage: auction.sharePercentage,
            annualKwh: 0, // recalculated by EnergySharesService against the live solar asset on first read
            purchasePrice: winningBid.amount,
          },
        });
      }
    });

    this.gateway.broadcastAuctionEnded(auctionId, { auctionId, winningBidId: winningBid?.id ?? null });
    return this.findOne(auctionId);
  }

  /** Runs every minute; closes any LIVE auction whose endDate has passed. */
  @Cron(CronExpression.EVERY_MINUTE)
  async autoCloseExpiredAuctions() {
    const expired = await this.prisma.auction.findMany({
      where: { status: AuctionStatus.LIVE, endDate: { lte: new Date() } },
      select: { id: true },
    });
    for (const { id } of expired) {
      this.logger.log(`Auto-closing expired auction ${id}`);
      await this.close(id);
    }
  }
}
