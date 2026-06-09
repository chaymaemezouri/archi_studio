import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ChecklistItemStatus } from '@prisma/client';

export class UpdateChecklistItemDto {
  @IsOptional()
  @IsEnum(ChecklistItemStatus)
  status?: ChecklistItemStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string | null;

  @IsOptional()
  @IsString()
  documentId?: string | null;
}
