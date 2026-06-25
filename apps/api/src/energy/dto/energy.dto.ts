import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PurchaseShareDto {
  @IsNumber() @Min(0.01) @Max(100)
  sharePercentage: number;

  @IsNumber() @Min(0)
  purchasePrice: number;
}

export class RecordProductionDto {
  @IsOptional() date?: string;
  @IsNumber() generatedKwh: number;
}
