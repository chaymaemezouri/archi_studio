import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotifType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  userId!: string;

  @IsEnum(NotifType)
  type!: NotifType;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsString()
  uniqueKey!: string;

  @IsOptional()
  @IsString()
  link?: string;
}
