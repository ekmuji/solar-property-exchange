import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { UsersModule } from './users/users.module';
import { PropertyModule } from './property/property.module';
import { EnergyModule } from './energy/energy.module';
import { TradingModule } from './trading/trading.module';
import { EvModule } from './ev/ev.module';
import { AuctionsModule } from './auctions/auctions.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    PropertyModule,
    EnergyModule,
    TradingModule,
    EvModule,
    AuctionsModule,
    PaymentsModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
