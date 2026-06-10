import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ProjectCategory, ProjectPhase, ProjectScale, ProjectStatus, ProjectVisibility } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  prefecture?: string;

  @IsOptional()
  @IsString()
  commune?: string;

  @IsOptional()
  @IsString()
  arrondissement?: string;

  @IsOptional()
  @IsNumber()
  coordinateX?: number;

  @IsOptional()
  @IsNumber()
  coordinateY?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  useTopoCoordinates?: boolean;

  @IsOptional()
  @IsString()
  mapsUrl?: string;

  @IsOptional()
  @IsString()
  driveUrl?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  projectNature?: string;

  @IsEnum(ProjectCategory)
  projectCategory!: ProjectCategory;

  @IsOptional()
  @IsEnum(ProjectScale)
  projectScale?: ProjectScale;

  @IsEnum(ProjectPhase)
  phase!: ProjectPhase;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsDateString()
  intakeDate?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsNumber()
  totalProjectAmount?: number;

  @IsOptional()
  @IsNumber()
  contractArchitectFees?: number;

  @IsOptional()
  @IsNumber()
  actualFeesToCollect?: number;

  @IsOptional()
  @IsNumber()
  surface?: number;

  @IsOptional()
  @IsNumber()
  titleSurface?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  /** STUDIO = projet commun du cabinet, PERSONAL = visible uniquement par vous */
  @IsOptional()
  @IsEnum(ProjectVisibility)
  visibility?: ProjectVisibility;

  /** Emails d'utilisateurs d'autres cabinets à inviter sur le projet */
  @IsOptional()
  @IsString({ each: true })
  collaboratorEmails?: string[];
}
