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
import { CreateProjectNoteDto } from './dto/project-note.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { UpdateProjectNoteDto } from './dto/project-note.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query('status') status?: string) {
    return this.projectsService.findAll(user.studioId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.projectsService.findOne(id, user.studioId);
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: AuthUser) {
    return this.projectsService.create(dto, user.studioId, user.id);
  }

  @Patch(':id/main-image')
  setMainImage(
    @Param('id') id: string,
    @Body('assetId') assetId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.setMainImageFromAsset(
      id,
      assetId,
      user.studioId,
      user.id,
    );
  }

  @Post(':id/notes')
  createNote(
    @Param('id') id: string,
    @Body() dto: CreateProjectNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.createNote(id, dto, user.studioId, user.id);
  }

  @Patch(':id/notes/:noteId')
  updateNote(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateProjectNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.updateNote(
      id,
      noteId,
      dto,
      user.studioId,
      user.id,
    );
  }

  @Delete(':id/notes/:noteId')
  removeNote(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.removeNote(id, noteId, user.studioId);
  }

  @Patch(':id/checklist/:itemId')
  updateChecklistItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateChecklistItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.updateChecklistItem(
      id,
      itemId,
      dto,
      user.studioId,
      user.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.update(id, dto, user.studioId, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.projectsService.remove(id, user.studioId);
  }
}
