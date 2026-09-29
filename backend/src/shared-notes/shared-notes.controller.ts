import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { SharedNoteFieldsDto } from './dto/shared-note.dto';
import { SharedNotesService } from './shared-notes.service';

function sharedFilesInterceptor() {
  const tmpDir = join(process.env.UPLOAD_DIR ?? 'uploads', '_tmp');
  return FilesInterceptor('files', 8, {
    limits: { fileSize: 25 * 1024 * 1024 },
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
        cb(null, tmpDir);
      },
      filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extname(file.originalname)}`);
      },
    }),
  });
}

@Controller('shared-notes')
export class SharedNotesController {
  constructor(private sharedNotes: SharedNotesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.sharedNotes.findAll(user);
  }

  @Post()
  @UseInterceptors(sharedFilesInterceptor())
  create(
    @Body() dto: SharedNoteFieldsDto,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    return this.sharedNotes.create(dto, files, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: SharedNoteFieldsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.sharedNotes.update(id, dto, user);
  }

  @Post(':id/files')
  @UseInterceptors(sharedFilesInterceptor())
  addFiles(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    return this.sharedNotes.addFiles(id, files, user);
  }

  @Delete(':id/files/:fileId')
  removeFile(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.sharedNotes.removeFile(id, fileId, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.sharedNotes.remove(id, user);
  }
}
