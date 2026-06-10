import { BadRequestException, Injectable } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import { parseCinOcrText } from './cin-ocr.util';

@Injectable()
export class CinOcrService {
  async extractFromImage(file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Image CIN requise');
    }
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Le fichier doit être une image');
    }

    const worker = await createWorker('fra', 1, {
      logger: () => undefined,
    });
    try {
      const { data } = await worker.recognize(file.buffer);
      return parseCinOcrText(data.text ?? '');
    } finally {
      await worker.terminate();
    }
  }
}
