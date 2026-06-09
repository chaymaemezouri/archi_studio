const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.dwg',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.zip',
]);

const ALLOWED_MIME_PREFIXES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument',
  'application/vnd.ms-excel',
  'application/acad',
  'image/vnd.dwg',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed',
];

export function inferDocumentFileType(
  mimeType: string,
  filename: string,
): string {
  const mime = mimeType.toLowerCase();
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));

  if (mime.includes('pdf') || ext === '.pdf') return 'PDF';
  if (mime.includes('wordprocessingml') || ext === '.docx' || ext === '.doc') {
    return 'DOCX';
  }
  if (mime.includes('spreadsheetml') || ext === '.xlsx' || ext === '.xls') {
    return 'XLSX';
  }
  if (ext === '.dwg' || mime.includes('dwg') || mime.includes('acad')) {
    return 'DWG';
  }
  if (mime.startsWith('image/')) return 'IMAGE';
  if (mime.includes('zip') || ext === '.zip') return 'ZIP';
  return 'OTHER';
}

export function validateUploadedFile(
  file: Express.Multer.File,
): string | null {
  if (!file) return 'Aucun fichier fourni.';
  if (file.size > MAX_FILE_SIZE) {
    return 'Fichier trop volumineux (max 50 Mo).';
  }

  const ext = file.originalname
    .toLowerCase()
    .slice(file.originalname.lastIndexOf('.'));
  const mime = file.mimetype.toLowerCase();

  const extOk = ALLOWED_EXTENSIONS.has(ext);
  const mimeOk = ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p) || mime.includes(p));

  if (!extOk && !mimeOk) {
    return 'Format de fichier non autorisé.';
  }

  return null;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
}
