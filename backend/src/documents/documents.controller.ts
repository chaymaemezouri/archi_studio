import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsService } from './documents.service';
import { inferDocumentFileType } from './document-file.util';

function tempUploadInterceptor() {
  const tmpDir = join(process.env.UPLOAD_DIR ?? 'uploads', '_tmp');
  return FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 },
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
        cb(null, tmpDir);
      },
      filename: (_req, file, cb) => {
        cb(null, `${Date.now()}${extname(file.originalname)}`);
      },
    }),
  });
}

@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('projectId') projectId?: string,
    @Query('clientId') clientId?: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('q') q?: string,
    @Query('unclassified') unclassified?: string,
  ) {
    return this.documentsService.findAll(user.studioId, {
      projectId,
      clientId,
      category,
      type,
      q,
      unclassified: unclassified === 'true',
    });
  }

  @Post('upload')
  @UseInterceptors(tempUploadInterceptor())
  async upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name?: string,
    @Body('category') category?: string,
    @Body('projectId') projectId?: string,
    @Body('clientId') clientId?: string,
    @Body('tags') tagsRaw?: string,
    @Body('description') description?: string,
  ) {
    const uploaded = this.documentsService.saveUploadedFile(
      file,
      user.studioId,
      { projectId: projectId || undefined, clientId: clientId || undefined },
    );

    const tags = tagsRaw
      ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    return this.documentsService.create(
      {
        name: name?.trim() || uploaded.originalName,
        originalName: uploaded.originalName,
        url: uploaded.url,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        type: inferDocumentFileType(uploaded.mimeType, uploaded.originalName),
        category: category || 'OTHER',
        projectId: projectId || undefined,
        clientId: clientId || undefined,
        tags,
        description: description?.trim() || undefined,
      },
      user.studioId,
      user.id,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.documentsService.findOne(id, user.studioId);
  }

  @Post()
  create(@Body() dto: CreateDocumentDto, @CurrentUser() user: AuthUser) {
    return this.documentsService.create(dto, user.studioId, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.documentsService.update(id, dto, user.studioId, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.documentsService.remove(id, user.studioId, user.id);
  }
}
