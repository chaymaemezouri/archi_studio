import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsObject()
  types?: Record<string, boolean>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  meetingSoonHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([3, 7, 14])
  deadlineHorizonDays?: number;
}
