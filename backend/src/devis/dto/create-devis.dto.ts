import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DevisStatus } from '@prisma/client';
import { DevisItemDto } from './devis-item.dto';

export class CreateDevisDto {
  @IsOptional()
  @IsEnum(DevisStatus)
  status?: DevisStatus;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DevisItemDto)
  items!: DevisItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tva?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  object?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
