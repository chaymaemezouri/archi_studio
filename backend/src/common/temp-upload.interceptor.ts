import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

export function tempUploadInterceptor(
  maxBytes = 5 * 1024 * 1024,
  fieldName = 'file',
) {
  const tmpDir = join(process.env.UPLOAD_DIR ?? 'uploads', '_tmp');
  return FileInterceptor(fieldName, {
    limits: { fileSize: maxBytes },
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
