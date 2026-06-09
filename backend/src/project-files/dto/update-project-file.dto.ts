import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectFileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  fileType?: string;
}
