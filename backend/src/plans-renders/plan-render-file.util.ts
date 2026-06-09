const MAX_FILE_SIZE = 50 * 1024 * 1024;

const PLAN_EXTENSIONS = new Set(['.pdf', '.dwg', '.jpg', '.jpeg', '.png', '.webp', '.zip']);
const RENDER_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.zip']);

export function validatePlanRenderFile(
  file: Express.Multer.File,
  kind: 'PLAN' | 'RENDER',
): string | null {
  if (!file) return 'Aucun fichier fourni.';
  if (file.size > MAX_FILE_SIZE) return 'Fichier trop volumineux (max 50 Mo).';

  const ext = file.originalname
    .toLowerCase()
    .slice(file.originalname.lastIndexOf('.'));
  const allowed = kind === 'PLAN' ? PLAN_EXTENSIONS : RENDER_EXTENSIONS;

  if (!allowed.has(ext)) {
    return `Format non autorisé pour un ${kind === 'PLAN' ? 'plan' : 'rendu'}.`;
  }
  return null;
}

export function inferFileType(mimeType: string, filename: string): string {
  const mime = mimeType.toLowerCase();
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  if (mime.includes('pdf') || ext === '.pdf') return 'PDF';
  if (ext === '.dwg' || mime.includes('dwg')) return 'DWG';
  if (mime.startsWith('image/')) return 'IMAGE';
  if (mime.includes('zip') || ext === '.zip') return 'ZIP';
  return 'OTHER';
}

export function thumbnailFor(mimeType: string, url: string): string | null {
  return mimeType.startsWith('image/') ? url : null;
}
