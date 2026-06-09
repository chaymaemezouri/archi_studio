import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProjectNoteDto {
  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}

export class UpdateProjectNoteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @IsOptional()
  @IsString()
  title?: string | null;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}
