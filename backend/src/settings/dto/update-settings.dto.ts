import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  cabinetName?: string;

  @IsOptional()
  @IsString()
  cabinetAddress?: string;

  @IsOptional()
  @IsString()
  cabinetPhone?: string;

  @IsOptional()
  @IsString()
  cabinetEmail?: string;

  @IsOptional()
  @IsString()
  cabinetLogo?: string;

  @IsOptional()
  @IsString()
  cabinetCity?: string;

  @IsOptional()
  @IsString()
  cabinetIce?: string;

  @IsOptional()
  @IsString()
  cabinetRc?: string;

  @IsOptional()
  @IsString()
  cabinetCnss?: string;

  @IsOptional()
  @IsString()
  cabinetPatente?: string;

  @IsOptional()
  @IsString()
  cabinetWebsite?: string;

  @IsOptional()
  @IsString()
  cabinetCountry?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankRib?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  paymentTermsDays?: number;

  @IsOptional()
  @IsString()
  invoiceFooter?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tvaDefault?: number;

  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @IsOptional()
  @IsString()
  devisPrefix?: string;

  @IsOptional()
  @IsString()
  cgv?: string;
}
