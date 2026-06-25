import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAuctionDto {
  @IsOptional() @IsString()
  energyShareId?: string;

  @IsNumber() @Min(0.01)
  sharePercentage: number;

  @IsNumber() @Min(0)
  reservePrice: number;

  @IsDateString()
  endDate: string;
}

export class PlaceBidDto {
  @IsNumber() @Min(0.01)
  amount: number;
}
