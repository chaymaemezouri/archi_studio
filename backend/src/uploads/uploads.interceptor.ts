import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

export function projectFileUploadInterceptor(
  uploadRoot = process.env.UPLOAD_DIR ?? 'uploads',
) {
  return FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 },
    storage: diskStorage({
      destination: (req, _file, cb) => {
        const type = req.params.type as string;
        const projectId = req.params.projectId as string;
        const dir = join(uploadRoot, type, projectId);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
  });
}
