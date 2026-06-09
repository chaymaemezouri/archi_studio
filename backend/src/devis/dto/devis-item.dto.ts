import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DevisItemDto {
  @IsString()
  description!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsInt()
  order?: number;
}
