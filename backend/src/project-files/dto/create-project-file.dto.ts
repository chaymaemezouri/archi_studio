import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateProjectFileDto {
  @IsString()
  projectId!: string;

  @IsString()
  name!: string;

  @IsString()
  url!: string;

  @IsString()
  mimeType!: string;

  @IsInt()
  @Min(0)
  size!: number;

  @IsString()
  fileType!: string;

  @IsOptional()
  @IsString()
  uploadedBy?: string;
}
