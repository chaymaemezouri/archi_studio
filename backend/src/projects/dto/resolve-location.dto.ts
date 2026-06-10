import { IsOptional, IsString } from 'class-validator';

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
}
