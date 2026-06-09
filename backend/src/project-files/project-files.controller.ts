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
import { CreateProjectFileDto } from './dto/create-project-file.dto';
import { UpdateProjectFileDto } from './dto/update-project-file.dto';
import { ProjectFilesService } from './project-files.service';

@Controller('project-files')
export class ProjectFilesController {
  constructor(private projectFilesService: ProjectFilesService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.projectFilesService.findAll(projectId);
  }

  @Get('by-type/:projectId/:fileType')
  findByType(
    @Param('projectId') projectId: string,
    @Param('fileType') fileType: string,
  ) {
    return this.projectFilesService.findByType(projectId, fileType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectFilesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProjectFileDto) {
    return this.projectFilesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectFileDto) {
    return this.projectFilesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectFilesService.remove(id);
  }
}
