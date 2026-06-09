import type {
  CalendarEventType,
  ChecklistItemStatus,
  ClientStatus,
  DevisStatus,
  InvoiceStatus,
  NotifType,
  PaymentMethod,
  Priority,
  ProjectCategory,
  ProjectPhase,
  ProjectScale,
  ProjectStatus,
  TaskStatus,
} from '@prisma/client';

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
    cabinetAddress: string;
    cabinetCity: string;
    cabinetPhone: string;
    cabinetEmail: string;
    cabinetIce?: string;
    cabinetRc?: string;
    cabinetCnss?: string;
    cabinetPatente?: string;
    tvaDefault: number;
    invoicePrefix: string;
    devisPrefix: string;
  };
  financeNumberOffset: number;
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
    financeNumberOffset: 0,
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
    financeNumberOffset: 100,
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

export interface ClientDef {
  id: string;
  name: string;
  type: string;
  company?: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  city: string;
  country: string;
  ice?: string;
  taxId?: string;
  rc?: string;
  source: string;
  status: ClientStatus;
  notes?: string;
}

export const CLIENTS_TEMPLATE: Omit<ClientDef, 'id'>[] = [
  {
    name: 'AFELLAD RAGHDA',
    type: 'particulier',
    email: 'raghda.afellad@email.ma',
    phone: '+212 612 345 678',
    address: 'Quartier Marshan, Tanger',
    city: 'Tanger',
    country: 'Maroc',
    source: 'Recommandation',
    status: 'ACTIVE',
    notes: 'Cliente VIP — projet villa en cours.',
  },
  {
    name: 'Yassine Maouni',
    type: 'particulier',
    email: 'yassine.maouni@email.ma',
    phone: '+212 661 234 567',
    address: 'Hay Al Andalous, Tétouan',
    city: 'Tétouan',
    country: 'Maroc',
    source: 'Bouche à oreille',
    status: 'ACTIVE',
  },
  {
    name: 'Amine Benyahya',
    type: 'particulier',
    email: 'amine.benyahya@email.ma',
    phone: '+212 622 987 654',
    secondaryPhone: '+212 539 123 456',
    address: 'Boulevard Pasteur, Tanger',
    city: 'Tanger',
    country: 'Maroc',
    source: 'Site web',
    status: 'ACTIVE',
  },
  {
    name: 'Leila El Amrani',
    type: 'particulier',
    email: 'leila.elamrani@email.ma',
    phone: '+212 633 456 789',
    address: 'Agdal, Rabat',
    city: 'Rabat',
    country: 'Maroc',
    source: 'LinkedIn',
    status: 'ACTIVE',
  },
  {
    name: 'Société Atlas Invest',
    type: 'entreprise',
    company: 'Atlas Invest SARL',
    email: 'contact@atlas-invest.ma',
    phone: '+212 522 111 222',
    address: 'Twin Center, Casablanca',
    city: 'Casablanca',
    country: 'Maroc',
    ice: '002345678000012',
    taxId: 'IF-12345678',
    rc: '987654',
    source: 'Appel d\'offres',
    status: 'ACTIVE',
    notes: 'Promoteur immobilier — plusieurs lots en discussion.',
  },
];

export interface ProjectDef {
  id: string;
  clientIndex: number;
  name: string;
  type: string;
  projectNature?: string;
  projectCategory?: ProjectCategory;
  projectScale?: ProjectScale;
  address: string;
  city: string;
  country: string;
  url?: string;
  phase: ProjectPhase;
  status: ProjectStatus;
  progress: number;
  deadlineDays?: number | null;
  intakeDaysAgo?: number | null;
  budget: number;
  surface: number;
  titleSurface?: number | null;
  description: string;
  imageUrl?: string;
  isFavorite: boolean;
  createdDaysAgo: number;
}

export const DEFAULT_CHECKLIST_TITLES = [
  'Certificat de propriété',
  'Plan cadastral',
  'Calcul de contenance',
  "Plan d'alignement",
  'Plan coté',
  'CIN propriétaire',
  'Attestation de stabilité',
] as const;

export type ChecklistSeedStatus = ChecklistItemStatus;

export interface ProjectChecklistSeed {
  title: string;
  status: ChecklistSeedStatus;
  notes?: string;
}

export const PROJECT_CHECKLIST_SEEDS: ProjectChecklistSeed[][] = [
  [
    { title: 'Certificat de propriété', status: 'VALIDATED' },
    { title: 'Plan cadastral', status: 'UPLOADED' },
    { title: 'Calcul de contenance', status: 'MISSING' },
    { title: "Plan d'alignement", status: 'UPLOADED' },
    { title: 'Plan coté', status: 'MISSING' },
    { title: 'CIN propriétaire', status: 'VALIDATED' },
    { title: 'Attestation de stabilité', status: 'MISSING' },
  ],
  [
    { title: 'Certificat de propriété', status: 'UPLOADED' },
    { title: 'Plan cadastral', status: 'MISSING' },
    { title: 'Calcul de contenance', status: 'MISSING' },
    { title: "Plan d'alignement", status: 'MISSING' },
    { title: 'Plan coté', status: 'UPLOADED' },
    { title: 'CIN propriétaire', status: 'MISSING' },
    { title: 'Attestation de stabilité', status: 'MISSING' },
  ],
  [
    { title: 'Certificat de propriété', status: 'VALIDATED' },
    { title: 'Plan cadastral', status: 'VALIDATED' },
    { title: 'Calcul de contenance', status: 'UPLOADED' },
    { title: "Plan d'alignement", status: 'UPLOADED' },
    { title: 'Plan coté', status: 'MISSING' },
    { title: 'CIN propriétaire', status: 'UPLOADED' },
    { title: 'Attestation de stabilité', status: 'MISSING' },
  ],
  [
    { title: 'Certificat de propriété', status: 'VALIDATED' },
    { title: 'Plan cadastral', status: 'VALIDATED' },
    { title: 'Calcul de contenance', status: 'VALIDATED' },
    { title: "Plan d'alignement", status: 'VALIDATED' },
    { title: 'Plan coté', status: 'VALIDATED' },
    { title: 'CIN propriétaire', status: 'VALIDATED' },
    { title: 'Attestation de stabilité', status: 'VALIDATED' },
  ],
  [
    { title: 'Certificat de propriété', status: 'UPLOADED' },
    { title: 'Plan cadastral', status: 'MISSING' },
    { title: 'Calcul de contenance', status: 'MISSING' },
    { title: "Plan d'alignement", status: 'MISSING' },
    { title: 'Plan coté', status: 'MISSING' },
    { title: 'CIN propriétaire', status: 'UPLOADED' },
    { title: 'Attestation de stabilité', status: 'MISSING' },
  ],
  [
    { title: 'Certificat de propriété', status: 'VALIDATED' },
    { title: 'Plan cadastral', status: 'UPLOADED' },
    { title: 'Calcul de contenance', status: 'MISSING' },
    { title: "Plan d'alignement", status: 'MISSING' },
    { title: 'Plan coté', status: 'MISSING' },
    { title: 'CIN propriétaire', status: 'VALIDATED' },
    { title: 'Attestation de stabilité', status: 'MISSING' },
  ],
  [
    { title: 'Certificat de propriété', status: 'UPLOADED' },
    { title: 'Plan cadastral', status: 'UPLOADED' },
    { title: 'Calcul de contenance', status: 'UPLOADED' },
    { title: "Plan d'alignement", status: 'MISSING' },
    { title: 'Plan coté', status: 'MISSING' },
    { title: 'CIN propriétaire', status: 'MISSING' },
    { title: 'Attestation de stabilité', status: 'MISSING' },
  ],
];

export const PROJECTS_TEMPLATE: Omit<ProjectDef, 'id'>[] = [
  {
    clientIndex: 0,
    name: 'Villa Panorama',
    type: 'Villa',
    projectNature: 'Architecture',
    projectCategory: 'PRIVATE',
    projectScale: 'SMALL',
    address: 'Route de Cap Spartel, Tanger',
    city: 'Tanger',
    country: 'Maroc',
    url: 'https://maps.google.com/?q=Cap+Spartel+Tanger',
    phase: 'DOSSIER_EXECUTION',
    status: 'ACTIVE',
    progress: 78,
    deadlineDays: 0,
    intakeDaysAgo: 50,
    budget: 850000,
    surface: 420,
    titleSurface: 420,
    description: 'Villa contemporaine R+1 avec vue mer — dossier d\'exécution en finalisation.',
    imageUrl: '/demo/projects/villa-1.jpg',
    isFavorite: true,
    createdDaysAgo: 45,
  },
  {
    clientIndex: 1,
    name: 'Villa Mohamed',
    type: 'Villa',
    projectNature: 'Architecture',
    projectCategory: 'PUBLIC',
    projectScale: 'SMALL',
    address: 'Lotissement Al Wahda, Tétouan',
    city: 'Tétouan',
    country: 'Maroc',
    phase: 'APD',
    status: 'ACTIVE',
    progress: 40,
    deadlineDays: -5,
    intakeDaysAgo: 95,
    budget: 620000,
    surface: 350,
    titleSurface: 350,
    description: 'Villa familiale — retard sur validation APD client.',
    imageUrl: '/demo/projects/villa-2.jpg',
    isFavorite: false,
    createdDaysAgo: 90,
  },
  {
    clientIndex: 4,
    name: 'Résidence Volubilis',
    type: 'Résidentiel',
    projectNature: 'Lotissement',
    projectCategory: 'PRIVATE',
    projectScale: 'LARGE',
    address: 'Avenue Moulay Ismail, Tanger',
    city: 'Tanger',
    country: 'Maroc',
    phase: 'ESQUISSE',
    status: 'ACTIVE',
    progress: 0,
    deadlineDays: null,
    intakeDaysAgo: 10,
    budget: 4200000,
    surface: 2800,
    titleSurface: 2800,
    description: 'Programme de 12 logements — phase esquisse.',
    imageUrl: '/demo/projects/facade-1.jpg',
    isFavorite: false,
    createdDaysAgo: 7,
  },
  {
    clientIndex: 1,
    name: 'Maison R+2 Tétouan',
    type: 'Maison',
    projectNature: 'Architecture',
    projectCategory: 'PRIVATE',
    projectScale: 'SMALL',
    address: 'Centre-ville, Tétouan',
    city: 'Tétouan',
    country: 'Maroc',
    phase: 'LIVRE',
    status: 'ACTIVE',
    progress: 100,
    deadlineDays: -30,
    intakeDaysAgo: 380,
    budget: 480000,
    surface: 280,
    titleSurface: 280,
    description: 'Projet livré — réception définitive effectuée.',
    imageUrl: '/demo/projects/villa-3.jpg',
    isFavorite: false,
    createdDaysAgo: 365,
  },
  {
    clientIndex: 2,
    name: 'Extension Villa Tanger',
    type: 'Extension',
    projectNature: 'Extension',
    projectCategory: 'PRIVATE',
    projectScale: 'SMALL',
    address: 'Malabata, Tanger',
    city: 'Tanger',
    country: 'Maroc',
    phase: 'DOSSIER_EXECUTION',
    status: 'ACTIVE',
    progress: 55,
    deadlineDays: 3,
    intakeDaysAgo: 65,
    budget: 180000,
    surface: 95,
    titleSurface: 95,
    description: 'Extension salon + suite parentale — plans d\'exécution.',
    imageUrl: '/demo/projects/interior-1.jpg',
    isFavorite: true,
    createdDaysAgo: 60,
  },
  {
    clientIndex: 3,
    name: 'Aménagement Bureau Centre-ville',
    type: 'Tertiaire',
    projectNature: 'Tertiaire',
    projectCategory: 'PRIVATE',
    projectScale: 'SMALL',
    address: 'Place de France, Rabat',
    city: 'Rabat',
    country: 'Maroc',
    phase: 'AUTORISATION',
    status: 'ACTIVE',
    progress: 40,
    deadlineDays: 14,
    intakeDaysAgo: 130,
    budget: 320000,
    surface: 180,
    description: 'Aménagement open space et salles de réunion.',
    imageUrl: '/demo/projects/interior-1.jpg',
    isFavorite: false,
    createdDaysAgo: 120,
  },
  {
    clientIndex: 4,
    name: 'Complexe sportif municipal',
    type: 'Équipement public',
    projectNature: 'Équipement public',
    projectCategory: 'PUBLIC',
    projectScale: 'LARGE',
    address: 'Zone industrielle, Tanger',
    city: 'Tanger',
    country: 'Maroc',
    phase: 'APS',
    status: 'ACTIVE',
    progress: 25,
    deadlineDays: 21,
    intakeDaysAgo: 40,
    budget: 8900000,
    surface: 5200,
    titleSurface: 12000,
    description: 'Marché public — consultation et études APS/APD/CPS.',
    imageUrl: '/demo/projects/facade-1.jpg',
    isFavorite: false,
    createdDaysAgo: 35,
  },
];

export const DEADLINE_TITLES = [
  'Remise dossier DCE',
  'DCE complet',
  'Visa de l\'architecte',
  'Autorisation communale',
  'Dépôt dossier client',
  'Livraison plans d\'exécution',
  'Dépôt dossier consultation',
];

export const TASK_TITLES = [
  'Préparer plan RDC',
  'Finaliser façade principale',
  'Envoyer dossier au client',
  'Vérifier surface du projet',
  'Appeler le client',
  'Préparer devis',
  'Ajouter rendu extérieur',
  'Corriger plan de masse',
  'Préparer dossier autorisation',
  'Mettre à jour progression DCE',
  'Appeler topographe',
  'Vérifier paiement facture',
  'Préparer réunion de demain',
  'Relancer client pour validation APS',
  'Mettre à jour maquette 3D',
];

export const PERSONAL_TASKS = [
  'Appeler topographe',
  'Vérifier paiement facture',
  'Préparer réunion de demain',
];

export const DEVIS_ITEMS = [
  { description: 'Conception et modélisation', unitPrice: 9000 },
  { description: 'Autorisation', unitPrice: 4200 },
  { description: 'Suivi du chantier', unitPrice: 10000 },
  { description: 'Conformité', unitPrice: 2500 },
  { description: 'Étude géotechnique', unitPrice: 4200 },
  { description: 'Étude béton armé et suivi de chantier', unitPrice: 10000 },
  { description: 'Topographe / plan coté', unitPrice: 2500 },
];

export const PAYMENT_TERMS =
  '40% à l\'avance — 60% après obtention de l\'autorisation';

export function calcFinanceTotals(
  items: { quantity?: number; unitPrice: number }[],
  tvaRate = 20,
) {
  const lines = items.map((item) => {
    const quantity = item.quantity ?? 1;
    const total = quantity * item.unitPrice;
    return { quantity, unitPrice: item.unitPrice, total };
  });
  const totalHT = lines.reduce((sum, line) => sum + line.total, 0);
  const totalTTC = totalHT * (1 + tvaRate / 100);
  return { lines, totalHT, totalTTC };
}

export function devisNumber(offset: number, index: number) {
  return `DEV-${String(offset + index).padStart(3, '0')}-2026`;
}

export function invoiceNumber(offset: number, index: number) {
  return `FAC-${String(offset + index).padStart(3, '0')}-2026`;
}

export type DevisSeedStatus = DevisStatus;
export type InvoiceSeedStatus = InvoiceStatus;

export const DEVIS_STATUSES: DevisSeedStatus[] = [
  'ACCEPTED',
  'SENT',
  'DRAFT',
  'REFUSED',
];

export const INVOICE_STATUSES: InvoiceSeedStatus[] = [
  'PAID',
  'PARTIAL',
  'SENT',
  'OVERDUE',
];

export const CALENDAR_EVENT_TYPES: CalendarEventType[] = [
  'DEADLINE_PROJECT',
  'MEETING',
  'SITE_VISIT',
  'INVOICE_REMINDER',
  'PAYMENT_REMINDER',
  'CUSTOM_EVENT',
];

export const NOTIF_TYPES: NotifType[] = [
  'DEADLINE_TODAY',
  'TASK_TODAY',
  'INVOICE_OVERDUE',
  'PAYMENT_RECEIVED',
  'DOCUMENT_ADDED',
];
