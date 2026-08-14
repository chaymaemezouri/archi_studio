import type { PrismaClient } from '@prisma/client';
import {
  CalendarEventPriority,
  CalendarEventStatus,
  CalendarEventType,
  ChecklistItemStatus,
  ClientStatus,
  DevisStatus,
  InvoiceStatus,
  PaymentMethod,
  Priority,
  ProjectCategory,
  ProjectPhase,
  ProjectScale,
  ProjectStatus,
  ProjectVisibility,
  Role,
  TaskStatus,
  TenderStatus,
} from '@prisma/client';
const DEFAULT_CHECKLIST_ITEMS = [
  'Certificat de propriété',
  'Plan cadastral',
  'Calcul de contenance',
  "Plan d'alignement",
  'Plan coté',
  'CIN propriétaire',
  'Attestation de stabilité',
] as const;

export const DEMO_ACCOUNT_PASSWORD = 'Demo2026!';
export const DEMO_EXPIRY_DAYS = 14;

export type DemoStudioKey = 'demo1' | 'demo2' | 'demo3';

export interface DemoStudioConfig {
  key: DemoStudioKey;
  id: string;
  slug: string;
  name: string;
  code: string;
  city: string;
  owner: { id: string; email: string; name: string };
  users: Array<{ id: string; email: string; name: string }>;
  settingsId: string;
  theme: {
    focus: string;
    privateProject: string;
    publicProject: string;
  };
}

const LEGACY_DEMO_SLUGS = ['demo-atlas', 'demo-medina', 'demo-casbah'] as const;

export const DEMO_STUDIO_CONFIGS: DemoStudioConfig[] = [
  {
    key: 'demo1',
    id: 'studio_demo_1',
    slug: 'demo-1',
    name: 'Demo 1',
    code: 'D1',
    city: 'Casablanca',
    owner: {
      id: 'user_demo_1_owner',
      email: 'demo1@archi.studio',
      name: 'Admin Demo 1',
    },
    users: [
      {
        id: 'user_demo_1_arch',
        email: 'archi1@demo-1.studio',
        name: 'Architecte Demo 1',
      },
      {
        id: 'user_demo_1_admin',
        email: 'ops1@demo-1.studio',
        name: 'Ops Demo 1',
      },
    ],
    settingsId: 'settings_demo_1',
    theme: {
      focus: 'villas contemporaines & résidences',
      privateProject: 'Villa Horizon',
      publicProject: 'Centre culturel municipal',
    },
  },
  {
    key: 'demo2',
    id: 'studio_demo_2',
    slug: 'demo-2',
    name: 'Demo 2',
    code: 'D2',
    city: 'Fès',
    owner: {
      id: 'user_demo_2_owner',
      email: 'demo2@archi.studio',
      name: 'Admin Demo 2',
    },
    users: [
      {
        id: 'user_demo_2_arch',
        email: 'archi2@demo-2.studio',
        name: 'Architecte Demo 2',
      },
      {
        id: 'user_demo_2_admin',
        email: 'ops2@demo-2.studio',
        name: 'Ops Demo 2',
      },
    ],
    settingsId: 'settings_demo_2',
    theme: {
      focus: 'réhabilitation & patrimoine',
      privateProject: 'Riad Centre Historique',
      publicProject: 'École communale',
    },
  },
  {
    key: 'demo3',
    id: 'studio_demo_3',
    slug: 'demo-3',
    name: 'Demo 3',
    code: 'D3',
    city: 'Rabat',
    owner: {
      id: 'user_demo_3_owner',
      email: 'demo3@archi.studio',
      name: 'Admin Demo 3',
    },
    users: [
      {
        id: 'user_demo_3_arch',
        email: 'archi3@demo-3.studio',
        name: 'Architecte Demo 3',
      },
      {
        id: 'user_demo_3_admin',
        email: 'ops3@demo-3.studio',
        name: 'Ops Demo 3',
      },
    ],
    settingsId: 'settings_demo_3',
    theme: {
      focus: 'équipements publics & bureaux',
      privateProject: 'Résidence Garden',
      publicProject: 'Groupe scolaire',
    },
  },
];

function daysFromNow(days: number, hours = 10): Date {
  const d = new Date();
  d.setHours(hours, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

function moneyLine(quantity: number, unitPrice: number) {
  const total = Math.round(quantity * unitPrice * 100) / 100;
  return { quantity, unitPrice, total };
}

function totals(items: Array<{ total: number }>, tva: number) {
  const totalHT =
    Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
  const totalTTC = Math.round(totalHT * (1 + tva / 100) * 100) / 100;
  return { totalHT, totalTTC };
}

function id(studioKey: string, ...parts: Array<string | number>) {
  return `demo_${studioKey}_${parts.join('_')}`;
}

async function wipeDemoStudioData(prisma: PrismaClient, studioId: string) {
  const projects = await prisma.project.findMany({
    where: { studioId },
    select: { id: true },
  });
  const projectIds = projects.map((p) => p.id);
  const clients = await prisma.client.findMany({
    where: { studioId },
    select: { id: true },
  });
  const clientIds = clients.map((c) => c.id);
  const users = await prisma.user.findMany({
    where: { studioId },
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);

  const invoices = await prisma.invoice.findMany({
    where: { studioId },
    select: { id: true },
  });
  const invoiceIds = invoices.map((i) => i.id);
  const devisList = await prisma.devis.findMany({
    where: { studioId },
    select: { id: true },
  });
  const devisIds = devisList.map((d) => d.id);

  await prisma.payment.deleteMany({ where: { studioId } });
  if (invoiceIds.length) {
    await prisma.invoiceAttachment.deleteMany({
      where: { invoiceId: { in: invoiceIds } },
    });
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: { in: invoiceIds } },
    });
  }
  await prisma.invoice.deleteMany({ where: { studioId } });
  if (devisIds.length) {
    await prisma.devisItem.deleteMany({ where: { devisId: { in: devisIds } } });
  }
  await prisma.devis.deleteMany({ where: { studioId } });
  await prisma.tender.deleteMany({ where: { studioId } });
  await prisma.calendarEvent.deleteMany({ where: { studioId } });
  await prisma.document.deleteMany({ where: { studioId } });
  await prisma.planRender.deleteMany({ where: { studioId } });
  await prisma.task.deleteMany({ where: { studioId } });

  if (userIds.length) {
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.activityLog.deleteMany({ where: { userId: { in: userIds } } });
  }

  if (projectIds.length) {
    await prisma.chantierLog.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.deadline.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    const meetings = await prisma.meeting.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true },
    });
    for (const meeting of meetings) {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { attendees: { set: [] } },
      });
    }
    await prisma.meeting.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.projectFile.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.projectChecklistItem.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.projectNote.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.phaseProgress.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.projectCollaborator.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.activityLog.deleteMany({
      where: { projectId: { in: projectIds } },
    });
  }

  if (clientIds.length) {
    await prisma.clientNote.deleteMany({
      where: { clientId: { in: clientIds } },
    });
    await prisma.clientDocument.deleteMany({
      where: { clientId: { in: clientIds } },
    });
    await prisma.activityLog.deleteMany({
      where: { clientId: { in: clientIds } },
    });
  }

  await prisma.project.deleteMany({ where: { studioId } });
  await prisma.client.deleteMany({ where: { studioId } });
}

async function seedOneDemoStudio(
  prisma: PrismaClient,
  config: DemoStudioConfig,
  passwordHash: string,
) {
  const expiresAt = daysFromNow(DEMO_EXPIRY_DAYS, 23);
  const tva = 20;
  const k = config.key;

  const studio = await prisma.studio.upsert({
    where: { slug: config.slug },
    update: {
      name: config.name,
      demoExpiresAt: expiresAt,
    },
    create: {
      id: config.id,
      slug: config.slug,
      name: config.name,
      logoUrl: null,
      demoExpiresAt: expiresAt,
    },
  });
  const studioId = studio.id;

  await prisma.settings.upsert({
    where: { studioId },
    update: {
      cabinetName: config.name,
      cabinetAddress: `Boulevard Demo ${config.code}, ${config.city}`,
      cabinetCity: config.city,
      cabinetPhone: '+212 5 22 00 00 00',
      cabinetEmail: config.owner.email,
      cabinetCountry: 'Maroc',
      bankName: 'Banque Populaire',
      bankRib: `007 ${config.code} 000000000000000001`,
      paymentTermsDays: 30,
      invoiceFooter: 'Compte démo — données fictives à usage de présentation.',
      tvaDefault: tva,
      invoicePrefix: `FAC-${config.code}`,
      devisPrefix: `DEV-${config.code}`,
    },
    create: {
      id: config.settingsId,
      studioId,
      cabinetName: config.name,
      cabinetAddress: `Boulevard Demo ${config.code}, ${config.city}`,
      cabinetCity: config.city,
      cabinetPhone: '+212 5 22 00 00 00',
      cabinetEmail: config.owner.email,
      cabinetCountry: 'Maroc',
      bankName: 'Banque Populaire',
      bankRib: `007 ${config.code} 000000000000000001`,
      paymentTermsDays: 30,
      invoiceFooter: 'Compte démo — données fictives à usage de présentation.',
      tvaDefault: tva,
      invoicePrefix: `FAC-${config.code}`,
      devisPrefix: `DEV-${config.code}`,
    },
  });

  await prisma.user.upsert({
    where: { email: config.owner.email },
    update: {
      name: config.owner.name,
      role: Role.OWNER,
      studioId,
      password: passwordHash,
    },
    create: {
      id: config.owner.id,
      email: config.owner.email,
      name: config.owner.name,
      role: Role.OWNER,
      studioId,
      password: passwordHash,
    },
  });

  // Ensure owner keeps stable id if email already existed with another id
  const owner = await prisma.user.findUniqueOrThrow({
    where: { email: config.owner.email },
  });

  const teamUsers = [];
  for (const u of config.users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: Role.USER,
        studioId,
        password: passwordHash,
        notificationPrefs: {
          enabled: u.email.includes('ops'),
        },
      },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: Role.USER,
        studioId,
        password: passwordHash,
        notificationPrefs: {
          enabled: u.email.includes('ops'),
        },
      },
    });
    teamUsers.push(
      await prisma.user.findUniqueOrThrow({ where: { email: u.email } }),
    );
  }

  await wipeDemoStudioData(prisma, studioId);

  const clientsData = [
    {
      id: id(k, 'client', 1),
      name: 'Hassan Alami',
      firstName: 'Hassan',
      lastName: 'Alami',
      type: 'INDIVIDUAL',
      email: `hassan.${k}@client.demo`,
      phone: '+212 661 100 001',
      city: config.city,
      status: ClientStatus.ACTIVE,
      source: 'RECOMMENDATION',
      cinNumber: `${config.code}123456`,
    },
    {
      id: id(k, 'client', 2),
      name: 'Fatima Zahra Bennani',
      firstName: 'Fatima Zahra',
      lastName: 'Bennani',
      type: 'INDIVIDUAL',
      email: `fatima.${k}@client.demo`,
      phone: '+212 661 100 002',
      city: config.city,
      status: ClientStatus.ACTIVE,
      source: 'WEBSITE',
      cinNumber: `${config.code}223456`,
    },
    {
      id: id(k, 'client', 3),
      name: 'Groupe Immobilier Demo',
      company: 'Groupe Immobilier Demo SA',
      type: 'COMPANY',
      email: `contact.${k}@immo.demo`,
      phone: '+212 522 100 003',
      city: config.city,
      status: ClientStatus.ACTIVE,
      source: 'RETURNING',
      ice: `001${config.code}000000001`,
      rc: `${config.code}1001`,
    },
    {
      id: id(k, 'client', 4),
      name: 'Commune Urbaine Demo',
      company: 'Commune Urbaine Demo',
      type: 'COMPANY',
      email: `mairie.${k}@gov.demo`,
      phone: '+212 537 100 004',
      city: config.city,
      status: ClientStatus.ACTIVE,
      source: 'OTHER',
      ice: `002${config.code}000000002`,
      rc: `${config.code}2002`,
    },
    {
      id: id(k, 'client', 5),
      name: 'Samir Kadiri',
      firstName: 'Samir',
      lastName: 'Kadiri',
      type: 'INDIVIDUAL',
      email: `samir.${k}@client.demo`,
      phone: '+212 661 100 005',
      city: 'Tanger',
      status: ClientStatus.INACTIVE,
      source: 'SOCIAL',
    },
    {
      id: id(k, 'client', 6),
      name: 'Résidences Lumière',
      company: 'Résidences Lumière SARL',
      type: 'COMPANY',
      email: `hello.${k}@lumiere.demo`,
      phone: '+212 522 100 006',
      city: config.city,
      status: ClientStatus.ACTIVE,
      source: 'RECOMMENDATION',
      ice: `003${config.code}000000003`,
    },
    {
      id: id(k, 'client', 7),
      name: 'Amina Saadi',
      firstName: 'Amina',
      lastName: 'Saadi',
      type: 'INDIVIDUAL',
      email: `amina.${k}@client.demo`,
      phone: '+212 661 100 007',
      city: 'Marrakech',
      status: ClientStatus.ARCHIVED,
      source: 'WEBSITE',
    },
  ];

  for (const c of clientsData) {
    await prisma.client.create({
      data: {
        ...c,
        studioId,
        country: 'Maroc',
        address: `Rue Demo ${config.code}`,
        notes: `Client démo ${config.name}`,
      },
    });
  }

  await prisma.clientNote.createMany({
    data: [
      {
        id: id(k, 'cnote', 1),
        clientId: id(k, 'client', 1),
        content: 'Premier contact positif, budget confirmé pour villa.',
      },
      {
        id: id(k, 'cnote', 2),
        clientId: id(k, 'client', 3),
        content: 'Demande APS pour lotissement 12 villas.',
      },
      {
        id: id(k, 'cnote', 3),
        clientId: id(k, 'client', 4),
        content: 'Appel d’offres public — délai strict.',
      },
    ],
  });

  await prisma.clientDocument.createMany({
    data: [
      {
        id: id(k, 'cdoc', 1),
        clientId: id(k, 'client', 1),
        name: 'CIN_recto.pdf',
        url: `/uploads/demo/${config.slug}/cin-recto.pdf`,
        mimeType: 'application/pdf',
        size: 240_000,
        docType: 'CIN',
      },
      {
        id: id(k, 'cdoc', 2),
        clientId: id(k, 'client', 3),
        name: 'RC_extrait.pdf',
        url: `/uploads/demo/${config.slug}/rc.pdf`,
        mimeType: 'application/pdf',
        size: 180_000,
        docType: 'RC',
      },
    ],
  });

  const privatePhases = [
    ProjectPhase.ESQUISSE,
    ProjectPhase.AUTORISATION,
    ProjectPhase.DOSSIER_EXECUTION,
  ] as const;
  const publicPhases = [
    ProjectPhase.CONSULTATION,
    ProjectPhase.APS,
    ProjectPhase.APD,
    ProjectPhase.CPS,
    ProjectPhase.AUTORISATION,
    ProjectPhase.DOSSIER_EXECUTION,
  ] as const;

  const projectsSpec = [
    {
      id: id(k, 'project', 1),
      name: config.theme.privateProject,
      clientId: id(k, 'client', 1),
      projectCategory: ProjectCategory.PRIVATE,
      phase: ProjectPhase.AUTORISATION,
      progress: 55,
      visibility: ProjectVisibility.STUDIO,
      isFavorite: true,
      budget: 2_800_000,
      surface: 420,
      managerId: teamUsers[0]?.id ?? owner.id,
    },
    {
      id: id(k, 'project', 2),
      name: config.theme.publicProject,
      clientId: id(k, 'client', 4),
      projectCategory: ProjectCategory.PUBLIC,
      phase: ProjectPhase.APD,
      progress: 40,
      visibility: ProjectVisibility.STUDIO,
      isFavorite: true,
      budget: 12_500_000,
      surface: 3200,
      managerId: owner.id,
    },
    {
      id: id(k, 'project', 3),
      name: `Bureau ${config.code} Business Park`,
      clientId: id(k, 'client', 3),
      projectCategory: ProjectCategory.PRIVATE,
      phase: ProjectPhase.ESQUISSE,
      progress: 18,
      visibility: ProjectVisibility.STUDIO,
      budget: 4_200_000,
      surface: 980,
      managerId: teamUsers[0]?.id ?? owner.id,
    },
    {
      id: id(k, 'project', 4),
      name: `Extension clinique ${config.city}`,
      clientId: id(k, 'client', 6),
      projectCategory: ProjectCategory.STATE,
      phase: ProjectPhase.CPS,
      progress: 62,
      visibility: ProjectVisibility.STUDIO,
      budget: 8_900_000,
      surface: 1500,
      managerId: owner.id,
    },
    {
      id: id(k, 'project', 5),
      name: `Appartements ${config.code} Vue Mer`,
      clientId: id(k, 'client', 2),
      projectCategory: ProjectCategory.PRIVATE,
      phase: ProjectPhase.DOSSIER_EXECUTION,
      progress: 78,
      visibility: ProjectVisibility.STUDIO,
      budget: 6_100_000,
      surface: 1100,
      managerId: teamUsers[1]?.id ?? owner.id,
    },
    {
      id: id(k, 'project', 6),
      name: `Étude personnelle ${config.code}`,
      clientId: id(k, 'client', 5),
      projectCategory: ProjectCategory.PRIVATE,
      phase: ProjectPhase.ESQUISSE,
      progress: 10,
      visibility: ProjectVisibility.PERSONAL,
      ownerId: teamUsers[0]?.id ?? owner.id,
      budget: 450_000,
      surface: 120,
      status: ProjectStatus.ACTIVE,
    },
    {
      id: id(k, 'project', 7),
      name: `Archive villa ${config.code} 2024`,
      clientId: id(k, 'client', 7),
      projectCategory: ProjectCategory.PRIVATE,
      phase: ProjectPhase.LIVRE,
      progress: 100,
      visibility: ProjectVisibility.STUDIO,
      status: ProjectStatus.ARCHIVED,
      budget: 1_900_000,
      surface: 310,
    },
  ];

  for (const p of projectsSpec) {
    const imageUrl = `/uploads/demo/${config.slug}/${p.id}-cover.jpg`;
    await prisma.project.create({
      data: {
        id: p.id,
        studioId,
        name: p.name,
        clientId: p.clientId,
        projectCategory: p.projectCategory,
        projectScale:
          p.projectCategory === ProjectCategory.PRIVATE
            ? ProjectScale.SMALL
            : ProjectScale.LARGE,
        phase: p.phase,
        progress: p.progress,
        visibility: p.visibility,
        ownerId: p.ownerId ?? owner.id,
        managerId: p.managerId ?? owner.id,
        status: p.status ?? ProjectStatus.ACTIVE,
        isFavorite: p.isFavorite ?? false,
        budget: p.budget,
        totalProjectAmount: p.budget,
        contractArchitectFees: Math.round((p.budget ?? 0) * 0.08),
        actualFeesToCollect: Math.round((p.budget ?? 0) * 0.06),
        surface: p.surface,
        titleSurface: p.surface,
        city: config.city,
        country: 'Maroc',
        address: `Lot Demo ${config.code}`,
        description: `${p.name} — scénario démo (${config.theme.focus}).`,
        imageUrl,
        intakeDate: daysFromNow(-60),
        deadline: daysFromNow(45),
        latitude: 33.5 + Math.random(),
        longitude: -7.6 + Math.random(),
      },
    });

    const phases: ProjectPhase[] =
      p.projectCategory === ProjectCategory.PRIVATE
        ? [...privatePhases]
        : [...publicPhases];
    for (const [index, phase] of phases.entries()) {
      const currentIndex = phases.indexOf(p.phase);
      const done = currentIndex >= index ? 100 : 20;
      await prisma.phaseProgress.create({
        data: {
          id: id(k, 'phase', p.id, phase),
          projectId: p.id,
          phase,
          progress: phase === p.phase ? Math.min(p.progress, 90) : done,
        },
      });
    }

    for (const [index, title] of DEFAULT_CHECKLIST_ITEMS.entries()) {
      const status =
        index < 3
          ? ChecklistItemStatus.VALIDATED
          : index < 5
            ? ChecklistItemStatus.UPLOADED
            : ChecklistItemStatus.MISSING;
      await prisma.projectChecklistItem.create({
        data: {
          id: id(k, 'check', p.id, index),
          projectId: p.id,
          title,
          status,
          sortOrder: index,
          fileUrl:
            status === ChecklistItemStatus.MISSING
              ? null
              : `/uploads/demo/${config.slug}/check-${index}.pdf`,
          uploadedAt:
            status === ChecklistItemStatus.MISSING ? null : daysFromNow(-10),
        },
      });
    }

    await prisma.projectNote.createMany({
      data: [
        {
          id: id(k, 'pnote', p.id, 1),
          projectId: p.id,
          title: 'Point client',
          content: 'Validation conceptuelle en cours.',
          pinned: true,
        },
        {
          id: id(k, 'pnote', p.id, 2),
          projectId: p.id,
          title: 'Technique',
          content: 'Vérifier contraintes de voirie et reculs.',
          pinned: false,
        },
      ],
    });

    await prisma.projectFile.createMany({
      data: [
        {
          id: id(k, 'pfile', p.id, 1),
          projectId: p.id,
          name: 'moodboard.jpg',
          url: `/uploads/demo/${config.slug}/moodboard.jpg`,
          mimeType: 'image/jpeg',
          size: 520_000,
          fileType: 'IMAGE',
          uploadedBy: owner.id,
        },
        {
          id: id(k, 'pfile', p.id, 2),
          projectId: p.id,
          name: 'cps-draft.pdf',
          url: `/uploads/demo/${config.slug}/cps.pdf`,
          mimeType: 'application/pdf',
          size: 880_000,
          fileType: 'CPS',
          uploadedBy: owner.id,
        },
      ],
    });
  }

  // Cross-studio style collab not required; intra-studio collab
  if (teamUsers[0]) {
    await prisma.projectCollaborator.create({
      data: {
        id: id(k, 'collab', 1),
        projectId: id(k, 'project', 1),
        userId: teamUsers[0].id,
      },
    });
  }
  if (teamUsers[1]) {
    await prisma.projectCollaborator.create({
      data: {
        id: id(k, 'collab', 2),
        projectId: id(k, 'project', 2),
        userId: teamUsers[1].id,
      },
    });
  }

  const taskDefs = [
    {
      title: 'Finaliser plan RDC',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: daysFromNow(0),
      projectId: id(k, 'project', 1),
    },
    {
      title: 'Relancer client pour CIN',
      status: TaskStatus.TODO,
      priority: Priority.URGENT,
      dueDate: daysFromNow(-1),
      projectId: id(k, 'project', 1),
      clientId: id(k, 'client', 1),
    },
    {
      title: 'Préparer présentation APS',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: daysFromNow(1),
      projectId: id(k, 'project', 2),
    },
    {
      title: 'Déposer dossier urbanisme',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: daysFromNow(7),
      projectId: id(k, 'project', 1),
    },
    {
      title: 'Corriger coupe façade',
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      dueDate: daysFromNow(-3),
      completedAt: daysFromNow(-2),
      projectId: id(k, 'project', 5),
    },
    {
      title: 'Chiffrage honoraires phase APD',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: daysFromNow(2),
      projectId: id(k, 'project', 2),
    },
    {
      title: 'Visite terrain topographie',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: daysFromNow(3),
      projectId: id(k, 'project', 3),
    },
    {
      title: 'Rédiger CCTP lots techniques',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: daysFromNow(5),
      projectId: id(k, 'project', 4),
    },
    {
      title: 'Archiver plans EXE',
      status: TaskStatus.DONE,
      priority: Priority.LOW,
      dueDate: daysFromNow(-10),
      completedAt: daysFromNow(-9),
      projectId: id(k, 'project', 7),
    },
    {
      title: 'Préparer réunion chantier',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.URGENT,
      dueDate: daysFromNow(0),
      projectId: id(k, 'project', 5),
    },
    {
      title: 'Envoyer avenant devis',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: daysFromNow(4),
      projectId: id(k, 'project', 3),
      clientId: id(k, 'client', 3),
    },
    {
      title: 'Annuler option terrain N-2',
      status: TaskStatus.CANCELLED,
      priority: Priority.LOW,
      dueDate: daysFromNow(-20),
      projectId: id(k, 'project', 6),
    },
  ];

  for (const [index, task] of taskDefs.entries()) {
    await prisma.task.create({
      data: {
        id: id(k, 'task', index + 1),
        studioId,
        title: task.title,
        description: `Tâche démo — ${config.name}`,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        projectId: task.projectId,
        clientId: task.clientId,
        assignedTo:
          index % 2 === 0 ? owner.id : (teamUsers[0]?.id ?? owner.id),
      },
    });
  }

  const deadlineDefs = [
    {
      title: 'Dépôt permis de construire',
      date: daysFromNow(-2),
      priority: Priority.URGENT,
      done: false,
      projectId: id(k, 'project', 1),
    },
    {
      title: 'Remise APS collectivité',
      date: daysFromNow(0),
      priority: Priority.HIGH,
      done: false,
      projectId: id(k, 'project', 2),
    },
    {
      title: 'Livraison DOE',
      date: daysFromNow(3),
      priority: Priority.HIGH,
      done: false,
      projectId: id(k, 'project', 5),
    },
    {
      title: 'Réponse AO public',
      date: daysFromNow(7),
      priority: Priority.MEDIUM,
      done: false,
      projectId: id(k, 'project', 2),
    },
    {
      title: 'Validation CPS',
      date: daysFromNow(14),
      priority: Priority.MEDIUM,
      done: false,
      projectId: id(k, 'project', 4),
    },
    {
      title: 'Clôture phase esquisse',
      date: daysFromNow(-8),
      priority: Priority.LOW,
      done: true,
      projectId: id(k, 'project', 3),
    },
  ];

  for (const [index, d] of deadlineDefs.entries()) {
    await prisma.deadline.create({
      data: {
        id: id(k, 'deadline', index + 1),
        ...d,
      },
    });
  }

  const meeting1Attendees = [owner.id, teamUsers[0]?.id].filter(
    Boolean,
  ) as string[];
  await prisma.meeting.create({
    data: {
      id: id(k, 'meeting', 1),
      title: 'Revue concept villa',
      date: daysFromNow(0, 11),
      startTime: '10:00',
      endTime: '11:30',
      location: `Agence ${config.city}`,
      notes: 'Présenter 2 options de façade.',
      projectId: id(k, 'project', 1),
      attendees: { connect: meeting1Attendees.map((uid) => ({ id: uid })) },
    },
  });
  await prisma.meeting.create({
    data: {
      id: id(k, 'meeting', 2),
      title: 'Comité technique APD',
      date: daysFromNow(2, 15),
      startTime: '14:00',
      endTime: '16:00',
      location: 'Salle réunion mairie',
      projectId: id(k, 'project', 2),
      attendees: {
        connect: [{ id: owner.id }, ...(teamUsers[1] ? [{ id: teamUsers[1].id }] : [])],
      },
    },
  });
  await prisma.meeting.create({
    data: {
      id: id(k, 'meeting', 3),
      title: 'Point chantier hebdo',
      date: daysFromNow(1, 9),
      startTime: '09:00',
      endTime: '10:00',
      location: 'Site',
      projectId: id(k, 'project', 5),
      attendees: { connect: [{ id: owner.id }] },
    },
  });
  await prisma.meeting.create({
    data: {
      id: id(k, 'meeting', 4),
      title: 'Kickoff extension clinique',
      date: daysFromNow(5, 16),
      startTime: '16:00',
      endTime: '17:00',
      location: 'Visio',
      projectId: id(k, 'project', 4),
      attendees: {
        connect: [owner.id, ...teamUsers.map((u) => u.id)].map((uid) => ({
          id: uid,
        })),
      },
    },
  });

  const calendarTypes = [
    CalendarEventType.SITE_VISIT,
    CalendarEventType.MEETING,
    CalendarEventType.DEADLINE_PROJECT,
    CalendarEventType.INVOICE_REMINDER,
    CalendarEventType.PAYMENT_REMINDER,
    CalendarEventType.CUSTOM_EVENT,
    CalendarEventType.DEADLINE_TASK,
  ];
  for (const [index, type] of calendarTypes.entries()) {
    await prisma.calendarEvent.create({
      data: {
        id: id(k, 'cal', index + 1),
        studioId,
        title: `${type} — ${config.code}`,
        type,
        date: daysFromNow(index - 1),
        startTime: '09:00',
        endTime: '10:00',
        projectId: id(k, 'project', (index % 5) + 1),
        clientId: id(k, 'client', (index % 4) + 1),
        priority:
          index % 3 === 0
            ? CalendarEventPriority.URGENT
            : CalendarEventPriority.NORMAL,
        status: CalendarEventStatus.ACTIVE,
        notes: 'Événement démo calendrier',
      },
    });
  }

  const docCategories = [
    'CONTRACT',
    'PERMIT',
    'CPS',
    'BPU',
    'INVOICE',
    'PLAN',
    'REPORT',
    'OTHER',
  ];
  for (const [index, category] of docCategories.entries()) {
    await prisma.document.create({
      data: {
        id: id(k, 'doc', index + 1),
        studioId,
        name: `${category}_${config.code}.pdf`,
        originalName: `${category}.pdf`,
        type: category,
        category,
        mimeType: 'application/pdf',
        size: 120_000 + index * 10_000,
        url: `/uploads/demo/${config.slug}/${category.toLowerCase()}.pdf`,
        projectId: id(k, 'project', (index % 5) + 1),
        clientId: id(k, 'client', (index % 4) + 1),
        tags: ['demo', config.slug],
        description: `Document démo ${category}`,
      },
    });
  }

  for (let i = 1; i <= 8; i++) {
    const kind = i <= 4 ? 'PLAN' : 'RENDER';
    await prisma.planRender.create({
      data: {
        id: id(k, 'plan', i),
        studioId,
        name: `${kind} ${i} ${config.code}`,
        originalName: `${kind.toLowerCase()}-${i}.png`,
        kind,
        category: i % 2 === 0 ? 'FACADE' : 'RDC',
        mimeType: 'image/png',
        fileType: 'IMAGE',
        size: 900_000 + i * 1000,
        url: `/uploads/demo/${config.slug}/${kind.toLowerCase()}-${i}.png`,
        thumbnailUrl: `/uploads/demo/${config.slug}/${kind.toLowerCase()}-${i}-thumb.png`,
        projectId: id(k, 'project', ((i - 1) % 5) + 1),
        clientId: id(k, 'client', ((i - 1) % 4) + 1),
        isFavorite: i === 1 || i === 5,
        isMainImage: i === 5,
        version: `v${i}`,
        tags: ['demo'],
      },
    });
  }

  for (let i = 1; i <= 4; i++) {
    await prisma.chantierLog.create({
      data: {
        id: id(k, 'chantier', i),
        projectId: id(k, 'project', 5),
        date: daysFromNow(-i * 3),
        siteVisit: `Visite #${i}`,
        chantierPhase: i < 3 ? 'GROS_OEUVRE' : 'SECOND_OEUVRE',
        description: `Avancement chantier démo jour ${i}`,
        progress: 50 + i * 8,
        issues: i === 2 ? 'Retard livraison acier' : null,
        nextSteps: 'Contrôle ferraillage et béton',
        photos: [
          `/uploads/demo/${config.slug}/chantier-${i}a.jpg`,
          `/uploads/demo/${config.slug}/chantier-${i}b.jpg`,
        ],
      },
    });
  }

  await prisma.tender.createMany({
    data: [
      {
        id: id(k, 'tender', 1),
        studioId,
        name: `AO ${config.code} — Gymnase municipal`,
        client: 'Commune Urbaine Demo',
        budget: 9_500_000,
        deadline: daysFromNow(12),
        status: TenderStatus.OPEN,
        probability: 55,
      },
      {
        id: id(k, 'tender', 2),
        studioId,
        name: `AO ${config.code} — Siège administratif`,
        client: 'Province Demo',
        budget: 15_000_000,
        deadline: daysFromNow(-5),
        status: TenderStatus.WON,
        probability: 90,
        convertedProjectId: id(k, 'project', 2),
      },
      {
        id: id(k, 'tender', 3),
        studioId,
        name: `AO ${config.code} — Marché couvert`,
        client: 'Régie Demo',
        budget: 4_200_000,
        deadline: daysFromNow(-20),
        status: TenderStatus.LOST,
        probability: 30,
      },
      {
        id: id(k, 'tender', 4),
        studioId,
        name: `AO ${config.code} — Archive 2025`,
        client: 'Ministère Demo',
        budget: 2_000_000,
        deadline: daysFromNow(-90),
        status: TenderStatus.ARCHIVED,
        probability: 10,
      },
    ],
  });

  const devisStatuses = [
    DevisStatus.DRAFT,
    DevisStatus.SENT,
    DevisStatus.ACCEPTED,
    DevisStatus.REFUSED,
    DevisStatus.EXPIRED,
    DevisStatus.SENT,
  ];

  for (const [index, status] of devisStatuses.entries()) {
    const items = [
      moneyLine(1, 25_000 + index * 5_000),
      moneyLine(1, 8_500),
    ];
    const { totalHT, totalTTC } = totals(items, tva);
    const devisId = id(k, 'devis', index + 1);
    await prisma.devis.create({
      data: {
        id: devisId,
        number: `DEV-${config.code}-${String(index + 1).padStart(3, '0')}-2026`,
        status,
        studioId,
        clientId: id(k, 'client', (index % 4) + 1),
        projectId: id(k, 'project', (index % 5) + 1),
        tva,
        totalHT,
        totalTTC,
        object: `Mission architecture — ${status}`,
        paymentTerms: '30% à la commande, solde à livraison',
        validUntil: daysFromNow(30),
        items: {
          create: items.map((item, order) => ({
            id: id(k, 'devisitem', index + 1, order + 1),
            description:
              order === 0 ? 'Honoraires conception' : 'Suivi administratif',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            order,
          })),
        },
      },
    });
  }

  const invoiceSpecs: Array<{
    status: InvoiceStatus;
    paidRatio: number;
    dueDays: number;
    devisIndex: number;
  }> = [
    { status: InvoiceStatus.DRAFT, paidRatio: 0, dueDays: 30, devisIndex: 1 },
    { status: InvoiceStatus.SENT, paidRatio: 0, dueDays: 20, devisIndex: 2 },
    { status: InvoiceStatus.PARTIAL, paidRatio: 0.4, dueDays: 10, devisIndex: 3 },
    { status: InvoiceStatus.PAID, paidRatio: 1, dueDays: -5, devisIndex: 3 },
    { status: InvoiceStatus.OVERDUE, paidRatio: 0, dueDays: -12, devisIndex: 2 },
    { status: InvoiceStatus.CANCELLED, paidRatio: 0, dueDays: 5, devisIndex: 5 },
  ];

  const methods = [
    PaymentMethod.VIREMENT,
    PaymentMethod.CHEQUE,
    PaymentMethod.ESPECES,
    PaymentMethod.CARTE,
    PaymentMethod.AUTRE,
  ];

  for (const [index, spec] of invoiceSpecs.entries()) {
    const items = [
      moneyLine(1, 30_000 + index * 4_000),
      moneyLine(1, 6_000),
    ];
    const { totalHT, totalTTC } = totals(items, tva);
    const paidAmount =
      Math.round(totalTTC * spec.paidRatio * 100) / 100;
    let status = spec.status;
    if (status !== InvoiceStatus.DRAFT && status !== InvoiceStatus.CANCELLED) {
      if (paidAmount >= totalTTC && totalTTC > 0) status = InvoiceStatus.PAID;
      else if (paidAmount > 0) status = InvoiceStatus.PARTIAL;
      else if (spec.dueDays < 0) status = InvoiceStatus.OVERDUE;
    }

    const invoiceId = id(k, 'invoice', index + 1);
    await prisma.invoice.create({
      data: {
        id: invoiceId,
        number: `${config.code}-${String(index + 1).padStart(3, '0')}-08/2026`,
        status,
        studioId,
        clientId: id(k, 'client', (index % 4) + 1),
        projectId: id(k, 'project', (index % 5) + 1),
        devisId: id(k, 'devis', spec.devisIndex),
        tva,
        totalHT,
        totalTTC,
        paidAmount,
        issueDate: daysFromNow(-20 + index),
        dueDate: daysFromNow(spec.dueDays),
        object: `Facture démo ${index + 1}`,
        phase: 'Honoraires',
        paymentMethod: methods[index % methods.length],
        items: {
          create: items.map((item, order) => ({
            id: id(k, 'invitem', index + 1, order + 1),
            description:
              order === 0 ? 'Honoraires phase' : 'Frais de dossier',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            order,
          })),
        },
        attachments: {
          create: [
            {
              id: id(k, 'invatt', index + 1),
              name: `facture-${index + 1}.pdf`,
              url: `/uploads/demo/${config.slug}/invoice-${index + 1}.pdf`,
            },
          ],
        },
      },
    });

    if (paidAmount > 0) {
      await prisma.payment.create({
        data: {
          id: id(k, 'payment', index + 1),
          studioId,
          invoiceId,
          clientId: id(k, 'client', (index % 4) + 1),
          projectId: id(k, 'project', (index % 5) + 1),
          amount: paidAmount,
          date: daysFromNow(-3),
          method: methods[index % methods.length],
          reference: `PAY-${config.code}-${index + 1}`,
          notes: 'Paiement démo',
        },
      });
    }
  }

  // Extra free-text payment without invoice link
  await prisma.payment.create({
    data: {
      id: id(k, 'payment', 'extra'),
      studioId,
      invoiceName: `Acompte libre ${config.code}`,
      clientName: 'Client hors fiche',
      projectName: 'Mission ponctuelle',
      amount: 5_000,
      date: daysFromNow(-1),
      method: PaymentMethod.VIREMENT,
      reference: `PAY-${config.code}-FREE`,
    },
  });

  const activityEntities = [
    'CLIENT',
    'PROJECT',
    'TASK',
    'DEVIS',
    'INVOICE',
    'PAYMENT',
    'DOCUMENT',
    'MEETING',
  ];
  for (let i = 0; i < 24; i++) {
    await prisma.activityLog.create({
      data: {
        id: id(k, 'activity', i + 1),
        userId: i % 2 === 0 ? owner.id : (teamUsers[0]?.id ?? owner.id),
        projectId: id(k, 'project', (i % 5) + 1),
        clientId: id(k, 'client', (i % 4) + 1),
        action: i % 3 === 0 ? 'CREATE' : i % 3 === 1 ? 'UPDATE' : 'VIEW',
        entity: activityEntities[i % activityEntities.length],
        entityId: id(k, 'entity', i + 1),
        details: { demo: true, studio: config.slug },
        createdAt: daysFromNow(-i),
      },
    });
  }

  return {
    email: config.owner.email,
    expiresAt,
    name: config.name,
  };
}

export async function seedDemoStudios(
  prisma: PrismaClient,
  passwordHash: string,
) {
  // Remove previous named demo tenants (Atlas/Medina/Casbah) if still present
  for (const slug of LEGACY_DEMO_SLUGS) {
    const legacy = await prisma.studio.findUnique({ where: { slug } });
    if (!legacy) continue;
    await wipeDemoStudioData(prisma, legacy.id);
    await prisma.user.deleteMany({ where: { studioId: legacy.id } });
    await prisma.settings.deleteMany({ where: { studioId: legacy.id } });
    await prisma.studio.delete({ where: { id: legacy.id } });
  }

  const results = [];
  for (const config of DEMO_STUDIO_CONFIGS) {
    results.push(await seedOneDemoStudio(prisma, config, passwordHash));
  }
  return results;
}
