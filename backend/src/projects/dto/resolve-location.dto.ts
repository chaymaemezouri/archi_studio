import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

function toOptionalNumber({ value }: { value: unknown }): number | undefined {
  if (value === '' || value == null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export class ResolveLocationQueryDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  arrondissement?: string;

  @IsOptional()
  @IsString()
  commune?: string;

  @IsOptional()
  @IsString()
  prefecture?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  longitude?: number;
}
