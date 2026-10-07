import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ReorderDayItemDto {
  @IsIn(['task', 'custom'])
  source!: 'task' | 'custom';

  @IsString()
  id!: string;
}

export class ReorderDayDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderDayItemDto)
  items!: ReorderDayItemDto[];
}
