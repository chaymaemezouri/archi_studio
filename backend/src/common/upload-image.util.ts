import { extname } from 'path';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
]);

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export function validateImageUpload(file: Express.Multer.File): string | null {
  if (!file) return 'Aucun fichier fourni';
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Image trop volumineuse (max. 5 Mo)';
  }

  const ext = extname(file.originalname).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return 'Format non supporté (JPG, PNG, WebP ou GIF)';
  }

  const mime = file.mimetype.toLowerCase();
  if (!ALLOWED_IMAGE_MIMES.has(mime) && !mime.startsWith('image/')) {
    return 'Type de fichier invalide';
  }

  return null;
}
