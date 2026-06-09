import type { Settings } from '@prisma/client';
import { UploadsService } from '../uploads/uploads.service';

export interface PdfBranding {
  cabinetName: string;
  cabinetAddress?: string | null;
  cabinetCity?: string | null;
  cabinetCountry?: string | null;
  cabinetPhone?: string | null;
  cabinetEmail?: string | null;
  cabinetWebsite?: string | null;
  cabinetIce?: string | null;
  cabinetRc?: string | null;
  cabinetCnss?: string | null;
  cabinetPatente?: string | null;
  bankName?: string | null;
  bankRib?: string | null;
  invoiceFooter?: string | null;
  cgv?: string | null;
  paymentTermsDays?: number;
  logoDataUri?: string | null;
}

/** Champs facturation PDF (schema Prisma étendu). */
type SettingsPdfFields = Settings & {
  cabinetCountry?: string | null;
  cabinetWebsite?: string | null;
  bankName?: string | null;
  bankRib?: string | null;
  invoiceFooter?: string | null;
  paymentTermsDays?: number;
};

export function settingsToPdfBranding(
  settings: Settings,
  uploads: UploadsService,
): PdfBranding {
  const s = settings as SettingsPdfFields;
  return {
    cabinetName: s.cabinetName ?? 'Cabinet',
    cabinetAddress: s.cabinetAddress,
    cabinetCity: s.cabinetCity,
    cabinetCountry: s.cabinetCountry,
    cabinetPhone: s.cabinetPhone,
    cabinetEmail: s.cabinetEmail,
    cabinetWebsite: s.cabinetWebsite,
    cabinetIce: s.cabinetIce,
    cabinetRc: s.cabinetRc,
    cabinetCnss: s.cabinetCnss,
    cabinetPatente: s.cabinetPatente,
    bankName: s.bankName,
    bankRib: s.bankRib,
    invoiceFooter: s.invoiceFooter,
    cgv: s.cgv,
    paymentTermsDays: s.paymentTermsDays ?? 30,
    logoDataUri: uploads.resolveImageDataUri(s.cabinetLogo),
  };
}
