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
import { CreatePlanRenderDto } from './dto/create-plan-render.dto';
import { UpdatePlanRenderDto } from './dto/update-plan-render.dto';
import { PlansRendersService } from './plans-renders.service';

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

@Controller('plans-renders')
export class PlansRendersController {
  constructor(private service: PlansRendersService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('kind') kind?: string,
    @Query('projectId') projectId?: string,
    @Query('clientId') clientId?: string,
    @Query('category') category?: string,
    @Query('q') q?: string,
    @Query('unclassified') unclassified?: string,
    @Query('favorites') favorites?: string,
  ) {
    return this.service.findAll(user.studioId, {
      kind,
      projectId,
      clientId,
      category,
      q,
      unclassified: unclassified === 'true',
      favorites: favorites === 'true',
    });
  }

  @Post('upload')
  @UseInterceptors(tempUploadInterceptor())
  async upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('kind') kind: 'PLAN' | 'RENDER',
    @Body('category') category: string,
    @Body('name') name?: string,
    @Body('projectId') projectId?: string,
    @Body('clientId') clientId?: string,
    @Body('version') version?: string,
    @Body('tags') tagsRaw?: string,
    @Body('description') description?: string,
    @Body('isMainImage') isMainImage?: string,
  ) {
    const uploaded = this.service.saveUploadedFile(file, user.studioId, kind, {
      projectId: projectId || undefined,
      clientId: clientId || undefined,
    });

    const tags = tagsRaw
      ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    return this.service.create(
      {
        name: name?.trim() || uploaded.originalName,
        originalName: uploaded.originalName,
        url: uploaded.url,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        thumbnailUrl: uploaded.thumbnailUrl ?? undefined,
        kind,
        category: category || 'AUTRE',
        projectId: projectId || undefined,
        clientId: clientId || undefined,
        version: version?.trim() || undefined,
        tags,
        description: description?.trim() || undefined,
        isMainImage: isMainImage === 'true',
      },
      user.studioId,
      user.id,
    );
  }

  @Patch(':id/main-image')
  setMainImage(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.setMainImage(id, user.studioId, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user.studioId);
  }

  @Post()
  create(@Body() dto: CreatePlanRenderDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.studioId, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlanRenderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user.studioId, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.remove(id, user.studioId, user.id);
  }
}
