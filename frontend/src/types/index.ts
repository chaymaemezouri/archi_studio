export type Role = "OWNER" | "USER";

export type ProjectPhase =
  | "ESQUISSE"
  | "CONSULTATION"
  | "APS"
  | "APD"
  | "CPS"
  | "AUTORISATION"
  | "DOSSIER_EXECUTION"
  | "DCE"
  | "EXECUTION"
  | "CHANTIER"
  | "LIVRE";

export type ProjectCategory = "PRIVATE" | "PUBLIC" | "STATE";
export type ProjectScale = "SMALL" | "LARGE";
export type ChecklistItemStatus = "MISSING" | "UPLOADED" | "VALIDATED";

export type ProjectStatus = "ACTIVE" | "ARCHIVED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "UNPAID"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";
export type DevisStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REFUSED" | "EXPIRED";
export type TenderStatus = "OPEN" | "WON" | "LOST" | "ARCHIVED";
export type PaymentMethod = "VIREMENT" | "CHEQUE" | "ESPECES" | "CARTE" | "AUTRE";

export interface Studio {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
  studioId: string;
  studio: Studio;
  createdAt: string;
}

export type ClientStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type ClientType = "INDIVIDUAL" | "COMPANY";
export type ClientSource =
  | "RECOMMENDATION"
  | "SOCIAL"
  | "WEBSITE"
  | "RETURNING"
  | "OTHER";

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  docType: string;
  createdAt: string;
}

export interface ClientFinancialSummary {
  totalQuotes: number;
  totalInvoiced: number;
  totalPaid: number;
  remainingAmount: number;
  unpaidInvoicesCount: number;
}

export interface Client {
  id: string;
  name: string;
  company?: string | null;
  type?: ClientType | string | null;
  email?: string | null;
  phone?: string | null;
  secondaryPhone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  ice?: string | null;
  taxId?: string | null;
  rc?: string | null;
  cnss?: string | null;
  source?: ClientSource | string | null;
  status?: ClientStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  projectsCount?: number;
  activeProjectsCount?: number;
  quotesCount?: number;
  pendingQuotesCount?: number;
  invoicesCount?: number;
  unpaidInvoicesCount?: number;
  totalQuotes?: number;
  totalInvoiced?: number;
  totalPaid?: number;
  remainingAmount?: number;
  projectNames?: string[];
  _count?: { projects: number; devis?: number; invoices?: number };
  projects?: Project[];
  devis?: Devis[];
  invoices?: Invoice[];
  payments?: Payment[];
  clientNotes?: ClientNote[];
  clientDocuments?: ClientDocument[];
  activityLogs?: ActivityLog[];
  financialSummary?: ClientFinancialSummary;
}

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Particulier",
  COMPANY: "Entreprise",
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  ARCHIVED: "Archivé",
};

export const CLIENT_SOURCE_LABELS: Record<string, string> = {
  RECOMMENDATION: "Recommandation",
  SOCIAL: "Réseaux sociaux",
  WEBSITE: "Site web",
  RETURNING: "Ancien client",
  OTHER: "Autre",
};

export const CLIENT_DOCUMENT_TYPE_LABELS: Record<string, string> = {
  ID: "CIN / Pièce d'identité",
  CONTRACT: "Contrat",
  AUTHORIZATION: "Autorisation",
  ADMIN: "Document administratif",
  OTHER: "Autre",
};

export interface ProjectNote {
  id: string;
  projectId: string;
  title?: string | null;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectChecklistItem {
  id: string;
  projectId: string;
  title: string;
  status: ChecklistItemStatus;
  fileUrl?: string | null;
  documentId?: string | null;
  uploadedAt?: string | null;
  notes?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  url?: string | null;
  type?: string | null;
  projectNature?: string | null;
  projectCategory?: ProjectCategory | null;
  projectScale?: ProjectScale | null;
  phase: ProjectPhase;
  status: ProjectStatus;
  intakeDate?: string | null;
  deadline?: string | null;
  budget?: number | null;
  surface?: number | null;
  titleSurface?: number | null;
  description?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  progress: number;
  isFavorite: boolean;
  clientId?: string | null;
  client?: Client | null;
  managerId?: string | null;
  manager?: User | null;
  createdAt: string;
  updatedAt: string;
  phaseProgress?: PhaseProgress[];
  projectNotes?: ProjectNote[];
  checklistItems?: ProjectChecklistItem[];
  tasks?: Task[];
  deadlines?: Deadline[];
  files?: ProjectFile[];
  documents?: Document[];
  planRenders?: PlanRender[];
  meetings?: Meeting[];
  chantierLogs?: ChantierLog[];
  devis?: Devis[];
  invoices?: Invoice[];
  activityLogs?: ActivityLog[];
}

export interface ChantierLog {
  id: string;
  date: string;
  description: string;
  progress?: number | null;
  issues?: string | null;
  nextSteps?: string | null;
  photos?: string[];
  projectId: string;
  createdAt: string;
}

export interface PhaseProgress {
  id: string;
  projectId: string;
  phase: ProjectPhase;
  progress: number;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  fileType: string;
  uploadedBy?: string | null;
  createdAt: string;
  project?: Project;
}

export type DocumentCategory =
  | "CONTRACT"
  | "AUTHORIZATION"
  | "CPS"
  | "BPU"
  | "ADMIN"
  | "CLIENT_DOC"
  | "PROJECT_DOC"
  | "OTHER";

export type DocumentFileType =
  | "PDF"
  | "DOCX"
  | "XLSX"
  | "DWG"
  | "IMAGE"
  | "ZIP"
  | "OTHER";

export interface Document {
  id: string;
  name: string;
  originalName?: string | null;
  type: DocumentFileType | string;
  mimeType: string;
  size: number;
  url: string;
  category: DocumentCategory | string;
  projectId?: string | null;
  projectName?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  tags?: string[];
  description?: string | null;
  uploadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  CONTRACT: "Contrat",
  AUTHORIZATION: "Autorisation",
  CPS: "CPS",
  BPU: "BPU",
  ADMIN: "Administratif",
  CLIENT_DOC: "Document client",
  PROJECT_DOC: "Document projet",
  OTHER: "Autre",
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  PDF: "PDF",
  DOCX: "DOCX",
  XLSX: "XLSX",
  DWG: "DWG",
  IMAGE: "Image",
  ZIP: "ZIP",
  OTHER: "Autre",
};

export type PlanRenderKind = "PLAN" | "RENDER";

export type PlanCategory =
  | "PLAN_RDC"
  | "PLAN_ETAGE"
  | "PLAN_TOITURE"
  | "PLAN_MASSE"
  | "FACADE"
  | "COUPE"
  | "PLAN_TECHNIQUE"
  | "AUTRE";

export type RenderCategory =
  | "RENDU_INTERIEUR"
  | "RENDU_EXTERIEUR"
  | "PERSPECTIVE"
  | "IMAGE_3D"
  | "VISUEL_CLIENT"
  | "RENDU_FINAL"
  | "AUTRE";

export interface PlanRender {
  id: string;
  name: string;
  originalName?: string | null;
  kind: PlanRenderKind;
  category: PlanCategory | RenderCategory | string;
  mimeType: string;
  fileType: string;
  size: number;
  url: string;
  thumbnailUrl?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  tags?: string[];
  description?: string | null;
  version?: string | null;
  isMainImage?: boolean;
  isFavorite?: boolean;
  uploadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const PLAN_CATEGORY_LABELS: Record<string, string> = {
  PLAN_RDC: "Plan RDC",
  PLAN_ETAGE: "Plan étage",
  PLAN_TOITURE: "Plan toiture",
  PLAN_MASSE: "Plan de masse",
  FACADE: "Façade",
  COUPE: "Coupe",
  PLAN_TECHNIQUE: "Plan technique",
  AUTRE: "Autre",
};

export const RENDER_CATEGORY_LABELS: Record<string, string> = {
  RENDU_INTERIEUR: "Rendu intérieur",
  RENDU_EXTERIEUR: "Rendu extérieur",
  PERSPECTIVE: "Perspective",
  IMAGE_3D: "Image 3D",
  VISUEL_CLIENT: "Visuel client",
  RENDU_FINAL: "Rendu final",
  AUTRE: "Autre",
};

export const PLAN_RENDER_KIND_LABELS: Record<PlanRenderKind, string> = {
  PLAN: "Plan",
  RENDER: "Rendu",
};

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  scheduledAt?: string | null;
  projectId?: string | null;
  project?: Project | null;
  projectName?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  notes?: string | null;
  completedAt?: string | null;
  assignedTo?: string | null;
  assignee?: User | null;
  createdAt: string;
  updatedAt: string;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

export interface Deadline {
  id: string;
  title: string;
  date: string;
  priority: Priority;
  done: boolean;
  projectId?: string | null;
  project?: Project | null;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  notes?: string | null;
  projectId?: string | null;
  project?: Project | null;
}

export interface Tender {
  id: string;
  name: string;
  client?: string | null;
  budget?: number | null;
  deadline?: string | null;
  status: TenderStatus;
  probability?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DevisItem {
  id: string;
  devisId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  order: number;
}

export interface Devis {
  id: string;
  number: string;
  status: DevisStatus;
  clientId?: string | null;
  client?: Client | null;
  projectId?: string | null;
  project?: Project | null;
  items?: DevisItem[];
  tva: number;
  totalHT: number;
  totalTTC: number;
  object?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  validUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  order: number;
}

export interface Payment {
  id: string;
  invoiceId?: string | null;
  clientId?: string | null;
  client?: Client | null;
  projectId?: string | null;
  project?: Project | null;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  proofUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
  invoice?: Invoice;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  clientId?: string | null;
  client?: Client | null;
  projectId?: string | null;
  project?: Project | null;
  devisId?: string | null;
  phase?: string | null;
  items?: InvoiceItem[];
  payments?: Payment[];
  tva: number;
  totalHT: number;
  totalTTC: number;
  paidAmount: number;
  issueDate: string;
  dueDate?: string | null;
  paymentMethod?: PaymentMethod | null;
  object?: string | null;
  bankTransferBy?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  user?: User | null;
  projectId?: string | null;
  project?: Pick<Project, "id" | "name"> | null;
  clientId?: string | null;
  client?: Pick<Client, "id" | "name"> | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardStats {
  activeProjects: number;
  upcomingDeadlines: number;
  pendingDevis: number;
  pendingInvoices: number;
  paymentsCount: number;
  unpaidInvoicesAmount: number;
  overdueInvoicesCount: number;
  lastPaymentDate?: string | null;
  lastPaymentAmount?: number | null;
  lastPaymentLabel?: string | null;
  nextDeadlineDate?: string | null;
  nextDeadlineTitle?: string | null;
  nextDeadlineProject?: string | null;
}

export type SmartAlertSeverity = "overdue" | "today" | "tomorrow" | "soon";
export type SmartAlertKind = "task" | "meeting" | "deadline";

export interface SmartAlert {
  id: string;
  kind: SmartAlertKind;
  severity: SmartAlertSeverity;
  title: string;
  subtitle?: string;
  date: string;
  time?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  entityId: string;
  done?: boolean;
}

export interface DashboardChartPoint {
  label: string;
  value: number;
}

export interface DashboardAgendaDay {
  label: string;
  tasks: number;
  deadlines: number;
  meetings: number;
}

export interface DashboardCharts {
  activityByDay: DashboardChartPoint[];
  revenueByMonth: DashboardChartPoint[];
}

export interface DashboardOverview {
  stats: DashboardStats;
  todayTasks: Task[];
  tomorrowTasks: Task[];
  calendarTasks: Task[];
  upcomingDeadlines: Deadline[];
  calendarDeadlines: Deadline[];
  recentActivity: ActivityLog[];
  meetings: Meeting[];
  recentPayments: Payment[];
  importantNotifications: Notification[];
  projectsInProgress: Project[];
  smartAlerts: SmartAlert[];
  charts?: DashboardCharts;
}

export interface SearchResultProject {
  id: string;
  name: string;
  city?: string | null;
  country?: string | null;
  phase: ProjectPhase;
}

export interface SearchResultClient {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
}

export interface SearchResultDocument {
  id: string;
  name: string;
  projectId: string;
  project?: { id: string; name: string };
}

export interface SearchResultTask {
  id: string;
  title: string;
  projectId?: string | null;
  project?: { id: string; name: string } | null;
}

export interface SearchResultFinance {
  id: string;
  kind: "devis" | "invoice";
  label: string;
  href: string;
}

export interface SearchResults {
  projects: SearchResultProject[];
  clients: SearchResultClient[];
  documents: SearchResultDocument[];
  tasks: SearchResultTask[];
  finances: SearchResultFinance[];
}

export interface AuthResponse {
  access_token?: string;
  accessToken?: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  inviteCode: string;
  name: string;
  email: string;
  password: string;
}

export const PROJECT_TYPE_OPTIONS = [
  "Architecture",
  "Réhabilitation",
  "Aménagement intérieur",
  "Extension",
  "Lotissement",
  "Concours",
  "Autre",
] as const;

export const PHASE_LABELS: Record<ProjectPhase, string> = {
  ESQUISSE: "Esquisse",
  CONSULTATION: "Consultation",
  APS: "APS",
  APD: "APD",
  CPS: "CPS",
  AUTORISATION: "Autorisation",
  DOSSIER_EXECUTION: "Dossier d'exécution",
  DCE: "DCE",
  EXECUTION: "Exécution",
  CHANTIER: "Chantier",
  LIVRE: "Livré",
};

export const PHASE_COLORS: Record<ProjectPhase, string> = {
  ESQUISSE: "bg-blue-500/20 text-blue-400",
  CONSULTATION: "bg-sky-500/20 text-sky-400",
  APS: "bg-purple-500/20 text-purple-400",
  APD: "bg-indigo-500/20 text-indigo-400",
  CPS: "bg-violet-500/20 text-violet-400",
  AUTORISATION: "bg-cyan-500/20 text-cyan-400",
  DOSSIER_EXECUTION: "bg-teal-500/20 text-teal-400",
  DCE: "bg-cyan-500/20 text-cyan-400",
  EXECUTION: "bg-amber-500/20 text-amber-400",
  CHANTIER: "bg-orange-500/20 text-orange-400",
  LIVRE: "bg-emerald-500/20 text-emerald-400",
};

export const CHECKLIST_STATUS_LABELS: Record<ChecklistItemStatus, string> = {
  MISSING: "Manquant",
  UPLOADED: "Ajouté",
  VALIDATED: "Validé",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  UNPAID: "Impayée",
  PARTIAL: "Partiellement payée",
  PAID: "Payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
};

export const DEVIS_STATUS_COLORS: Record<DevisStatus, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400",
  SENT: "bg-blue-500/20 text-blue-400",
  ACCEPTED: "bg-emerald-500/20 text-emerald-400",
  REFUSED: "bg-red-500/20 text-red-400",
  EXPIRED: "bg-amber-500/20 text-amber-400",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400",
  SENT: "bg-blue-500/20 text-blue-400",
  UNPAID: "bg-amber-500/20 text-amber-400",
  PARTIAL: "bg-orange-500/20 text-orange-400",
  PAID: "bg-emerald-500/20 text-emerald-400",
  OVERDUE: "bg-red-500/20 text-red-400",
  CANCELLED: "bg-gray-500/20 text-gray-400",
};

export const DEVIS_STATUS_LABELS: Record<DevisStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  REFUSED: "Refusé",
  EXPIRED: "Expiré",
};

export const TENDER_STATUS_LABELS: Record<TenderStatus, string> = {
  OPEN: "Ouvert",
  WON: "Gagné",
  LOST: "Perdu",
  ARCHIVED: "Archivé",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "bg-gray-500/20 text-gray-400",
  MEDIUM: "bg-blue-500/20 text-blue-400",
  HIGH: "bg-orange-500/20 text-orange-400",
  URGENT: "bg-red-500/20 text-red-400",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgent",
};

export const PRIORITY_BADGE_LIGHT: Record<Priority, string> = {
  LOW: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  MEDIUM: "bg-amber-50 text-amber-800 ring-amber-100",
  HIGH: "bg-orange-50 text-orange-800 ring-orange-100",
  URGENT: "bg-red-50 text-red-700 ring-red-100",
};

export type CalendarEventType =
  | "DEADLINE_PROJECT"
  | "DEADLINE_TASK"
  | "MEETING"
  | "SITE_VISIT"
  | "INVOICE_REMINDER"
  | "PAYMENT_REMINDER"
  | "CUSTOM_EVENT";

export type CalendarEventSource =
  | "custom"
  | "project"
  | "deadline"
  | "task"
  | "meeting"
  | "chantier"
  | "invoice"
  | "payment";

export type CalendarViewMode = "month" | "week" | "day" | "list";

export type CalendarTypeFilter =
  | "all"
  | "DEADLINE_PROJECT"
  | "DEADLINE_TASK"
  | "MEETING"
  | "SITE_VISIT"
  | "INVOICE_REMINDER"
  | "PAYMENT_REMINDER";

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  invoiceId?: string | null;
  priority?: string;
  status?: string;
  notes?: string | null;
  location?: string | null;
  source: CalendarEventSource;
  sourceId?: string;
  editable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const CALENDAR_EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  DEADLINE_PROJECT: "Deadline projet",
  DEADLINE_TASK: "Deadline tâche",
  MEETING: "Réunion",
  SITE_VISIT: "Visite chantier",
  INVOICE_REMINDER: "Rappel facture",
  PAYMENT_REMINDER: "Rappel paiement",
  CUSTOM_EVENT: "Événement",
};

/** Fond + texte événements (contour via calendarEventChipBase / calendarListRow) */
export const CALENDAR_EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  DEADLINE_PROJECT: "bg-[#8ba4c7]/12 text-[#b8cfe8]/90",
  DEADLINE_TASK: "bg-violet-500/10 text-violet-300/90",
  MEETING: "bg-blue-500/10 text-blue-300/90",
  SITE_VISIT: "bg-emerald-500/10 text-emerald-300/90",
  INVOICE_REMINDER: "bg-amber-500/10 text-amber-300/90",
  PAYMENT_REMINDER: "bg-white/[0.03] text-[#9aa3b0]/75",
  CUSTOM_EVENT: "bg-[#8ba4c7]/10 text-[#c5d8ee]/90",
};

/** Accent barre gauche (vue liste / détail jour) */
export const CALENDAR_EVENT_TYPE_ACCENT: Record<CalendarEventType, string> = {
  DEADLINE_PROJECT: "border-l-[#8ba4c7]/30",
  DEADLINE_TASK: "border-l-violet-400/35",
  MEETING: "border-l-blue-400/35",
  SITE_VISIT: "border-l-emerald-400/35",
  INVOICE_REMINDER: "border-l-amber-400/35",
  PAYMENT_REMINDER: "border-l-[#8ba4c7]/20",
  CUSTOM_EVENT: "border-l-[#8ba4c7]/25",
};
