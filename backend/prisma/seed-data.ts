export const DEMO_PASSWORD = 'Archi2026!';

export type StudioKey = 'amini' | 'maouni';

export interface StudioSeedConfig {
  key: StudioKey;
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  email: string;
  adminName: string;
  settingsId: string;
  settings: {
    cabinetName: string;
    cabinetAddress?: string;
    cabinetCity?: string;
    cabinetPhone?: string;
    cabinetEmail?: string;
    cabinetIce?: string;
    cabinetRc?: string;
    cabinetCnss?: string;
    cabinetPatente?: string;
    tvaDefault: number;
    invoicePrefix: string;
    devisPrefix: string;
  };
}

export const STUDIO_CONFIGS: StudioSeedConfig[] = [
  {
    key: 'amini',
    id: 'studio_amini',
    slug: 'amini',
    name: 'Amini Architects',
    logoUrl: '/studios/amini.png',
    email: 'admin@amini.architects',
    adminName: 'Amini El Mehdi',
    settingsId: 'settings_amini',
    settings: {
      cabinetName: 'Amini Architects',
      cabinetAddress: 'Avenue Mohammed V, Tanger, Maroc',
      cabinetCity: 'Tanger',
      cabinetPhone: '+212 600 000 001',
      cabinetEmail: 'admin@amini.architects',
      tvaDefault: 20,
      invoicePrefix: 'FAC',
      devisPrefix: 'DEV',
    },
  },
  {
    key: 'maouni',
    id: 'studio_maouni',
    slug: 'maouni',
    name: 'Maouni Architecture',
    logoUrl: '/studios/maouni.png',
    email: 'admin@maouni.architecture',
    adminName: 'Maouni Admin',
    settingsId: 'settings_maouni',
    settings: {
      cabinetName: 'MAOUNI ARCHITECTURE SARL AU',
      cabinetAddress:
        'AVENUE MOULAY ISMAIL RESIDENCE VOLUBILIS BLOC C 1ERE ETAGE N°53 TANGER',
      cabinetCity: 'Tanger',
      cabinetPhone: '+212663651900',
      cabinetEmail: 'maouni@ma-architecture.ma',
      cabinetIce: '003820483000057',
      cabinetRc: '168401',
      cabinetCnss: '6500980',
      cabinetPatente: '57235252',
      tvaDefault: 20,
      invoicePrefix: 'FAC',
      devisPrefix: 'DEV',
    },
  },
];
