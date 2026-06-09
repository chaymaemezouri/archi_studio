import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { projectFileUploadInterceptor } from './uploads.interceptor';

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post(':type/:projectId')
  @UseInterceptors(projectFileUploadInterceptor())
  upload(
    @Param('type') type: string,
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    return {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: this.uploadsService.publicUrl(type, projectId, file.filename),
      path: file.path,
    };
  }
}
