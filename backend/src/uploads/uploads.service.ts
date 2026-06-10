import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
} from 'fs';
import { extname, join } from 'path';
import { validateImageUpload } from '../common/upload-image.util';

@Injectable()
export class UploadsService {
  constructor(private config: ConfigService) {}

  getUploadRoot(): string {
    return this.config.get('UPLOAD_DIR', 'uploads');
  }

  publicUrl(type: string, scopeId: string, filename: string): string {
    return `/api/uploads/files/${type}/${scopeId}/${filename}`;
  }

  /** Logo studio ou avatar utilisateur */
  saveBrandingImage(
    file: Express.Multer.File,
    kind: 'studio-logo' | 'user-avatar',
    scopeId: string,
  ) {
    const err = validateImageUpload(file);
    if (err) throw new BadRequestException(err);

    const type = kind === 'studio-logo' ? 'branding' : 'avatars';
    const uploadRoot = this.getUploadRoot();
    const dir = join(uploadRoot, type, scopeId);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const ext = extname(file.originalname).toLowerCase() || '.png';
    const filename = kind === 'studio-logo' ? `logo${ext}` : `avatar${ext}`;

    for (const existing of readdirSync(dir)) {
      if (existing.startsWith(kind === 'studio-logo' ? 'logo' : 'avatar')) {
        try {
          unlinkSync(join(dir, existing));
        } catch {
          /* ignore */
        }
      }
    }

    const destPath = join(dir, filename);
    renameSync(file.path, destPath);

    return {
      filename,
      mimeType: file.mimetype,
      size: file.size,
      url: this.publicUrl(type, scopeId, filename),
    };
  }

  /** Justificatif de paiement (image) */
  savePaymentProof(file: Express.Multer.File, studioId: string) {
    const err = validateImageUpload(file);
    if (err) throw new BadRequestException(err);

    const type = 'payment-proofs';
    const uploadRoot = this.getUploadRoot();
    const dir = join(uploadRoot, type, studioId);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `${Date.now()}${ext}`;
    const destPath = join(dir, filename);
    renameSync(file.path, destPath);

    return {
      filename,
      mimeType: file.mimetype,
      size: file.size,
      url: this.publicUrl(type, studioId, filename),
    };
  }

  /** Convertit une URL publique d'upload en data URI pour les PDF (Puppeteer). */
  resolveImageDataUri(publicUrl: string | null | undefined): string | null {
    if (!publicUrl?.trim()) return null;
    const trimmed = publicUrl.trim();
    if (trimmed.startsWith('data:')) return trimmed;

    const prefix = '/api/uploads/files/';
    let relPath: string | null = null;
    if (trimmed.startsWith(prefix)) {
      relPath = trimmed.slice(prefix.length);
    } else {
      try {
        const u = new URL(trimmed);
        const idx = u.pathname.indexOf(prefix);
        if (idx >= 0) relPath = u.pathname.slice(idx + prefix.length);
      } catch {
        return trimmed.startsWith('http') ? trimmed : null;
      }
    }

    if (!relPath) return trimmed.startsWith('http') ? trimmed : null;

    const filePath = join(this.getUploadRoot(), ...relPath.split('/'));
    if (!existsSync(filePath)) return null;

    const ext = extname(filePath).toLowerCase();
    const mime =
      ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : ext === '.webp'
            ? 'image/webp'
            : ext === '.svg'
              ? 'image/svg+xml'
              : 'application/octet-stream';

    const buf = readFileSync(filePath);
    return `data:${mime};base64,${buf.toString('base64')}`;
  }
}