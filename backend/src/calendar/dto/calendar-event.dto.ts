import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  CalendarEventPriority,
  CalendarEventStatus,
  CalendarEventType,
} from '@prisma/client';

const HEX_COLOR = /^#([0-9A-Fa-f]{6})$/;

export class CreateCalendarEventDto {
  @IsString()
  @MinLength(1)
  title!: string;

  /** Optionnel — défaut CUSTOM_EVENT côté service */
  @IsOptional()
  @IsEnum(CalendarEventType)
  type?: CalendarEventType;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @Matches(HEX_COLOR, { message: 'color must be a hex color (#RRGGBB)' })
  color?: string | null;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsEnum(CalendarEventPriority)
  priority?: CalendarEventPriority;

  @IsOptional()
  @IsEnum(CalendarEventStatus)
  status?: CalendarEventStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCalendarEventDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsEnum(CalendarEventType)
  type?: CalendarEventType;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @Matches(HEX_COLOR, { message: 'color must be a hex color (#RRGGBB)' })
  color?: string | null;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsEnum(CalendarEventPriority)
  priority?: CalendarEventPriority;

  @IsOptional()
  @IsEnum(CalendarEventStatus)
  status?: CalendarEventStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
