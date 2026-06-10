import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddProjectCollaboratorDto } from './dto/project-collaborator.dto';
import { CreateProjectNoteDto } from './dto/project-note.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { UpdateProjectNoteDto } from './dto/project-note.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ResolveLocationQueryDto } from './dto/resolve-location.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query('status') status?: string) {
    return this.projectsService.findAll(user, status);
  }

  @Get('location/resolve')
  resolveLocation(@Query() query: ResolveLocationQueryDto) {
    return this.projectsService.resolveLocation(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.projectsService.findOne(id, user);
  }

  @Get(':id/collaborators')
  listCollaborators(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.projectsService.listCollaborators(id, user);
  }

  @Post(':id/collaborators')
  addCollaborator(
    @Param('id') id: string,
    @Body() dto: AddProjectCollaboratorDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.addCollaborator(id, dto.email, user);
  }

  @Delete(':id/collaborators/:userId')
  removeCollaborator(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.removeCollaborator(id, userId, user);
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: AuthUser) {
    return this.projectsService.create(dto, user);
  }

  @Patch(':id/main-image')
  setMainImage(
    @Param('id') id: string,
    @Body('assetId') assetId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.setMainImageFromAsset(id, assetId, user);
  }

  @Post(':id/notes')
  createNote(
    @Param('id') id: string,
    @Body() dto: CreateProjectNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.createNote(id, dto, user);
  }

  @Patch(':id/notes/:noteId')
  updateNote(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateProjectNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.updateNote(id, noteId, dto, user);
  }

  @Delete(':id/notes/:noteId')
  removeNote(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.removeNote(id, noteId, user);
  }

  @Patch(':id/checklist/:itemId')
  updateChecklistItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateChecklistItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.updateChecklistItem(id, itemId, dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.projectsService.remove(id, user);
  }
}
