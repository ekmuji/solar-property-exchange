import { Controller, Get, UseGuards } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/auth.module';
import { User } from '@prisma/client';
import { TradeSide, TradeStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /** Aggregated investor portfolio: shares owned, kWh entitlement, revenue to date. */
  async getPortfolio(userId: string) {
    const shares = await this.prisma.energyShare.findMany({
      where: { ownerId: userId },
      include: { warehouse: { select: { id: true, name: true, address: true } } },
    });

    const sells = await this.prisma.energyTrade.findMany({
      where: { 
        userId: userId, 
        side: TradeSide.SELL, 
        status: { in: ['FILLED', 'PARTIALLY_FILLED'] } },
    });

    const revenueGenerated = sells.reduce((sum, t) => sum + Number(t.pricePerKwh) * t.filledKwh, 0);
    const totalKwhEntitlement = shares.reduce((sum, s) => sum + s.annualKwh, 0);
    const totalValue = shares.reduce((sum, s) => sum + Number(s.purchasePrice ?? 0), 0);
    const energySold = sells.reduce((sum, t) => sum + t.filledKwh, 0);

    return {
      shares,
      summary: {
        sharesOwned: shares.length,
        currentValue: totalValue,
        revenueGenerated,
        annualKwhEntitlement: totalKwhEntitlement,
        energySold,
      },
    };
  }
}

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: User) {
    return user;
  }

  @Get('me/portfolio')
  portfolio(@CurrentUser() user: User) {
    return this.usersService.getPortfolio(user.id);
  }
}

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
