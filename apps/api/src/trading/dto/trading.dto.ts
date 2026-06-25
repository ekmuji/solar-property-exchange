import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PlaceOrderDto {
  @IsIn(['BUY', 'SELL'])
  side: 'BUY' | 'SELL';

  @IsNumber() @Min(1)
  quantityKwh: number;

  @IsNumber() @Min(0.0001)
  pricePerKwh: number;

  @IsOptional() @IsString()
  warehouseId?: string;
}
