import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ReserveChargerDto {
  @IsDateString()
  startTime: string;

  @IsInt() @Min(5)
  durationMinutes: number;
}

export class CompleteSessionDto {
  @IsNumber() @Min(0)
  energyDeliveredKwh: number;
}

export class CreateChargerDto {
  @IsString() label: string;
  @IsString() chargerType: string;
  @IsNumber() powerKw: number;
  @IsNumber() pricePerKwh: number;
}
