import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber() @Min(0.5)
  amount: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsIn(['ENERGY_SHARE', 'CHARGING_SESSION', 'AUCTION_SETTLEMENT', 'RENT'])
  purpose: 'ENERGY_SHARE' | 'CHARGING_SESSION' | 'AUCTION_SETTLEMENT' | 'RENT';

  @IsOptional() @IsString()
  chargingSessionId?: string;

  @IsOptional() @IsString()
  description?: string;
}
