import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CinOcrService } from './cin-ocr.service';
import { ClientsService } from './clients.service';
import { CreateClientDocumentDto } from './dto/client-document.dto';
import {
  CreateClientNoteDto,
  UpdateClientNoteDto,
} from './dto/client-note.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(
    private clientsService: ClientsService,
    private cinOcrService: CinOcrService,
  ) {}

  @Post('ocr/cin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  ocrCin(@UploadedFile() file: Express.Multer.File) {
    return this.cinOcrService.extractFromImage(file);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.clientsService.findAll(user.studioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.clientsService.findOne(id, user.studioId);
  }

  @Post()
  create(@Body() dto: CreateClientDto, @CurrentUser() user: AuthUser) {
    return this.clientsService.create(dto, user.studioId, user.id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.clientsService.archive(id, user.studioId, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.clientsService.update(id, dto, user.studioId, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.clientsService.remove(id, user.studioId);
  }

  @Post(':id/notes')
  createNote(
    @Param('id') id: string,
    @Body() dto: CreateClientNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.clientsService.createNote(id, dto, user.studioId, user.id);
  }

  @Patch(':id/notes/:noteId')
  updateNote(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateClientNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.clientsService.updateNote(
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
    return this.clientsService.removeNote(id, noteId, user.studioId);
  }

  @Post(':id/documents')
  createDocument(
    @Param('id') id: string,
    @Body() dto: CreateClientDocumentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.clientsService.createDocument(id, dto, user.studioId, user.id);
  }

  @Delete(':id/documents/:docId')
  removeDocument(
    @Param('id') id: string,
    @Param('docId') docId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.clientsService.removeDocument(id, docId, user.studioId);
  }
}
