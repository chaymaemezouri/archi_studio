import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePlanRenderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  projectId?: string | null;

  @IsOptional()
  @IsString()
  clientId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  isMainImage?: boolean;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
