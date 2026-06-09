import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  name!: string;

  @IsString()
  url!: string;

  @IsString()
  mimeType!: string;

  @IsInt()
  @Min(0)
  size!: number;

  @IsOptional()
  @IsString()
  originalName?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}
