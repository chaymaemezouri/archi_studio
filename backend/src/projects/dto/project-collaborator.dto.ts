import { IsEmail, IsString } from 'class-validator';

export class AddProjectCollaboratorDto {
  @IsEmail()
  email!: string;
}

export class InviteProjectCollaboratorsDto {
  @IsString({ each: true })
  emails!: string[];
}
