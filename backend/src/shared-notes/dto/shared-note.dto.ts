import { ValidateIf, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SharedNoteFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  contactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  contactPhone?: string;

  @IsOptional()
  @ValidateIf((_, value) => typeof value === 'string' && value.trim().length > 0)
  @IsEmail()
  @MaxLength(160)
  contactEmail?: string;

  /** JSON : [{ "kind": "CLIENT"|"PROJECT"|"DOCUMENT"|"PLAN"|"RENDER", "entityId": "..." }] */
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  refs?: string;
}
