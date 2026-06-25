import { Type } from 'class-transformer';
import { IsArray, IsInt, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SearchWarehousesDto {
  @IsOptional() @IsLatitude() @Type(() => Number) lat?: number;
  @IsOptional() @IsLongitude() @Type(() => Number) lng?: number;
  @IsOptional() @Type(() => Number) @Min(1) radiusMiles?: number = 50;

  @IsOptional() @Type(() => Number) @Min(0) minSolarCapacityKw?: number;
  @IsOptional() @Type(() => Number) @Min(0) minEvChargers?: number;
  @IsOptional() @Type(() => Number) @Min(0) maxInternalPricePerKwh?: number;
  @IsOptional() onlyWithAvailableUnits?: string; // 'true' | 'false', parsed as query string
  @IsOptional() onlyWithEnergyShares?: string;

  @IsOptional() @IsInt() @Type(() => Number) page?: number = 1;
  @IsOptional() @IsInt() @Type(() => Number) limit?: number = 20;
}

export class CreateWarehouseDto {
  @IsString() name: string;
  @IsString() address: string;
  @IsLatitude() @Type(() => Number) latitude: number;
  @IsLongitude() @Type(() => Number) longitude: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() photos?: string[];
}

export class CreateUnitDto {
  @IsString() unitNumber: string;
  @IsNumber() sqft: number;
  @IsNumber() monthlyRent: number;
  @IsOptional() availableDate?: string;
}

export class CreateSolarAssetDto {
  @IsNumber() capacityKw: number;
  @IsNumber() annualGenerationKwh: number;
  @IsOptional() @IsNumber() batteryCapacityKwh?: number;
}
