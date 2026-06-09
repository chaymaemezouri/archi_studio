import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateClientDocumentDto {
  @IsString()
  name!: string;

  @IsString()
  url!: string;

  @IsString()
  mimeType!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;

  @IsOptional()
  @IsString()
  docType?: string;
}
