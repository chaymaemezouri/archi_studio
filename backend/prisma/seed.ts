import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import {
  PrismaClient,
  type PaymentMethod,
  type Priority,
  type TaskStatus,
} from '@prisma/client';
import {
  CALENDAR_EVENT_TYPES,
  CLIENTS_TEMPLATE,
  DEMO_PASSWORD,
  DEADLINE_TITLES,
  DEVIS_ITEMS,
  DEVIS_STATUSES,
  INVOICE_STATUSES,
  NOTIF_TYPES,
  PAYMENT_TERMS,
  PERSONAL_TASKS,
  PROJECT_CHECKLIST_SEEDS,
  PROJECTS_TEMPLATE,
  STUDIO_CONFIGS,
  TASK_TITLES,
  calcFinanceTotals,
  devisNumber,
  invoiceNumber,
  type StudioKey,
  type StudioSeedConfig,
} from './seed-data';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const counts = {
  studios: 0,
  clients: 0,
  projects: 0,
  documents: 0,
  planRenders: 0,
  devis: 0,
  invoices: 0,
  payments: 0,
  tasks: 0,
  deadlines: 0,
  meetings: 0,
  calendarEvents: 0,
  chantierLogs: 0,
  notifications: 0,
  activityLogs: 0,
};

function daysFromNow(days: number, hour = 12): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function daysAgo(days: number, hour = 12): Date {
  return daysFromNow(-days, hour);
}

function id(key: StudioKey, suffix: string) {
  return `demo_${key}_${suffix}`;
}

async function clearStudioDemoData(studioId: string) {
  const userIds = (
    await prisma.user.findMany({ where: { studioId }, select: { id: true } })
  ).map((u) => u.id);

  const clientIds = (
    await prisma.client.findMany({ where: { studioId }, select: { id: true } })
  ).map((c) => c.id);

  const projectIds = (
    await prisma.project.findMany({ where: { studioId }, select: { id: true } })
  ).map((p) => p.id);

  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });

  const invoiceIds = (
    await prisma.invoice.findMany({
      where: {
        OR: [
          { clientId: { in: clientIds } },
          { projectId: { in: projectIds } },
        ],
      },
      select: { id: true },
    })
  ).map((i) => i.id);

  if (invoiceIds.length) {
    await prisma.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
    await prisma.invoiceAttachment.deleteMany({
      where: { invoiceId: { in: invoiceIds } },
    });
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
    await prisma.invoice.deleteMany({ where: { id: { in: invoiceIds } } });
  }

  await prisma.payment.deleteMany({
    where: {
      OR: [
        { clientId: { in: clientIds } },
        { projectId: { in: projectIds } },
      ],
    },
  });

  const devisIds = (
    await prisma.devis.findMany({
      where: {
        OR: [
          { clientId: { in: clientIds } },
          { projectId: { in: projectIds } },
        ],
      },
      select: { id: true },
    })
  ).map((d) => d.id);

  if (devisIds.length) {
    await prisma.devisItem.deleteMany({ where: { devisId: { in: devisIds } } });
    await prisma.devis.deleteMany({ where: { id: { in: devisIds } } });
  }

  await prisma.calendarEvent.deleteMany({ where: { studioId } });
  await prisma.planRender.deleteMany({ where: { studioId } });
  await prisma.document.deleteMany({ where: { studioId } });
  await prisma.tender.deleteMany({ where: { studioId } });

  await prisma.task.deleteMany({
    where: {
      OR: [
        { studioId },
        { projectId: { in: projectIds } },
        { clientId: { in: clientIds } },
      ],
    },
  });

  if (projectIds.length) {
    await prisma.meeting.deleteMany({ where: { projectId: { in: projectIds } } });
    await prisma.chantierLog.deleteMany({ where: { projectId: { in: projectIds } } });
    await prisma.deadline.deleteMany({ where: { projectId: { in: projectIds } } });
    await prisma.phaseProgress.deleteMany({ where: { projectId: { in: projectIds } } });
    await prisma.projectFile.deleteMany({ where: { projectId: { in: projectIds } } });
    await prisma.activityLog.deleteMany({ where: { projectId: { in: projectIds } } });
  }

  if (clientIds.length) {
    await prisma.clientNote.deleteMany({ where: { clientId: { in: clientIds } } });
    await prisma.clientDocument.deleteMany({ where: { clientId: { in: clientIds } } });
    await prisma.activityLog.deleteMany({ where: { clientId: { in: clientIds } } });
  }

  await prisma.project.deleteMany({ where: { studioId } });
  await prisma.client.deleteMany({ where: { studioId } });
}

async function upsertCoreStudio(config: StudioSeedConfig, password: string) {
  await prisma.studio.upsert({
    where: { slug: config.slug },
    update: {
      name: config.name,
      logoUrl: config.logoUrl,
    },
    create: {
      id: config.id,
      slug: config.slug,
      name: config.name,
      logoUrl: config.logoUrl,
    },
  });

  await prisma.settings.upsert({
    where: { studioId: config.id },
    update: config.settings,
    create: {
      id: config.settingsId,
      studioId: config.id,
      ...config.settings,
    },
  });

  await prisma.user.upsert({
    where: { email: config.email },
    update: {
      name: config.adminName,
      role: 'OWNER',
      studioId: config.id,
      password,
    },
    create: {
      email: config.email,
      name: config.adminName,
      password,
      role: 'OWNER',
      studioId: config.id,
    },
  });
}

async function seedStudioDemo(config: StudioSeedConfig, ownerId: string) {
  const key = config.key;

  await clearStudioDemoData(config.id);

  const clientIds: string[] = [];
  for (let i = 0; i < CLIENTS_TEMPLATE.length; i++) {
    const template = CLIENTS_TEMPLATE[i];
    const clientId = id(key, `client_${i + 1}`);
    await prisma.client.create({
      data: {
        id: clientId,
        studioId: config.id,
        ...template,
      },
    });
    clientIds.push(clientId);
    counts.clients++;

    await prisma.clientNote.create({
      data: {
        id: id(key, `client_note_${i + 1}`),
        clientId,
        content: `Note de suivi — ${template.name} : premier contact positif, dossier en cours.`,
      },
    });
  }

  const projectIds: string[] = [];
  const projectSlugs = [
    'villa_panorama',
    'villa_mohamed',
    'residence_volubilis',
    'maison_r2',
    'extension_villa',
    'bureau_rabat',
    'complexe_sportif',
  ];

  for (let i = 0; i < PROJECTS_TEMPLATE.length; i++) {
    const template = PROJECTS_TEMPLATE[i];
    const projectId = id(key, `proj_${projectSlugs[i]}`);
    const clientId = clientIds[template.clientIndex];
    const deadline =
      template.deadlineDays === null || template.deadlineDays === undefined
        ? null
        : daysFromNow(template.deadlineDays);
    const intakeDate =
      template.intakeDaysAgo === null || template.intakeDaysAgo === undefined
        ? null
        : daysAgo(template.intakeDaysAgo);

    await prisma.project.create({
      data: {
        id: projectId,
        studioId: config.id,
        clientId,
        managerId: ownerId,
        name: template.name,
        type: template.type,
        projectNature: template.projectNature,
        projectCategory: template.projectCategory ?? 'PRIVATE',
        projectScale: template.projectScale,
        address: template.address,
        city: template.city,
        country: template.country,
        url: template.url,
        phase: template.phase,
        status: template.status,
        progress: template.progress,
        deadline,
        intakeDate,
        budget: template.budget,
        surface: template.surface,
        titleSurface: template.titleSurface,
        description: template.description,
        imageUrl: template.imageUrl,
        isFavorite: template.isFavorite,
        createdAt: daysAgo(template.createdDaysAgo),
        updatedAt: daysAgo(Math.max(1, Math.floor(template.createdDaysAgo / 3))),
        phaseProgress: {
          create: [
            ...(template.phase !== 'ESQUISSE'
              ? [{ phase: 'ESQUISSE' as const, progress: 100 }]
              : []),
            { phase: template.phase, progress: template.progress },
          ],
        },
        checklistItems: {
          create: (PROJECT_CHECKLIST_SEEDS[i] ?? PROJECT_CHECKLIST_SEEDS[0]).map(
            (item, sortOrder) => ({
              title: item.title,
              status: item.status,
              sortOrder,
              notes: item.notes,
              uploadedAt:
                item.status === 'UPLOADED' || item.status === 'VALIDATED'
                  ? daysAgo(Math.max(1, template.createdDaysAgo - 5))
                  : undefined,
              fileUrl:
                item.status === 'UPLOADED' || item.status === 'VALIDATED'
                  ? '/demo/documents/placeholder.pdf'
                  : undefined,
            }),
          ),
        },
      },
    });
    projectIds.push(projectId);
    counts.projects++;
  }

  const deadlineOffsets = [0, 1, 3, -2, -7, 14, 21];
  for (let i = 0; i < projectIds.length; i++) {
    const projectId = projectIds[i];
    await prisma.deadline.create({
      data: {
        id: id(key, `deadline_${i + 1}`),
        projectId,
        title: DEADLINE_TITLES[i] ?? `Deadline projet ${i + 1}`,
        date: daysFromNow(deadlineOffsets[i] ?? 7),
        priority: deadlineOffsets[i] <= 0 ? 'URGENT' : 'MEDIUM',
        done: i === 5 && projectIds[i] === id(key, 'proj_maison_r2'),
      },
    });
    counts.deadlines++;
  }

  const taskStatuses: TaskStatus[] = [
    'TODO',
    'IN_PROGRESS',
    'DONE',
    'CANCELLED',
    'TODO',
    'IN_PROGRESS',
    'DONE',
    'TODO',
    'IN_PROGRESS',
    'DONE',
    'TODO',
    'IN_PROGRESS',
    'TODO',
    'DONE',
    'IN_PROGRESS',
  ];
  const taskPriorities: Priority[] = [
    'URGENT',
    'HIGH',
    'MEDIUM',
    'LOW',
    'URGENT',
    'HIGH',
    'MEDIUM',
    'LOW',
    'URGENT',
    'HIGH',
    'MEDIUM',
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT',
  ];
  const taskDueOffsets = [0, 1, -3, 5, 0, 2, -1, 7, 0, 3, null, -2, 1, null, 0];

  for (let i = 0; i < TASK_TITLES.length; i++) {
    const title = TASK_TITLES[i];
    const isPersonal = PERSONAL_TASKS.includes(title);
    const projectId = isPersonal ? null : projectIds[i % projectIds.length];
    const dueDate =
      taskDueOffsets[i] === null ? null : daysFromNow(taskDueOffsets[i]!);

    await prisma.task.create({
      data: {
        id: id(key, `task_${i + 1}`),
        studioId: config.id,
        title,
        description: isPersonal ? 'Tâche personnelle du cabinet.' : `Tâche liée au projet.`,
        status: taskStatuses[i],
        priority: taskPriorities[i],
        dueDate,
        projectId,
        assignedTo: ownerId,
        completedAt: taskStatuses[i] === 'DONE' ? daysAgo(2) : null,
      },
    });
    counts.tasks++;
  }

  const meetingTitles = [
    'Réunion lancement projet',
    'Présentation APS au client',
    'Validation DCE',
    'Réunion chantier',
    'Réunion paiement / facturation',
  ];
  for (let i = 0; i < meetingTitles.length; i++) {
    await prisma.meeting.create({
      data: {
        id: id(key, `meeting_${i + 1}`),
        projectId: projectIds[i % projectIds.length],
        title: meetingTitles[i],
        date: daysFromNow(i === 0 ? 0 : i * 2),
        startTime: `${9 + i}:00`,
        endTime: `${10 + i}:30`,
        location: i % 2 === 0 ? 'Bureau cabinet' : 'Visio Google Meet',
        notes: 'Ordre du jour préparé — documents envoyés au client.',
        attendees: { connect: [{ id: ownerId }] },
      },
    });
    counts.meetings++;
  }

  const calendarTitles = [
    'Deadline remise DCE',
    'Réunion client APS',
    'Visite chantier fondations',
    'Rappel facture FAC',
    'Rappel paiement client',
    'Événement personnalisé — rendez-vous urbanisme',
  ];
  for (let i = 0; i < calendarTitles.length; i++) {
    await prisma.calendarEvent.create({
      data: {
        id: id(key, `cal_${i + 1}`),
        studioId: config.id,
        projectId: projectIds[i % projectIds.length],
        clientId: clientIds[i % clientIds.length],
        title: calendarTitles[i],
        type: CALENDAR_EVENT_TYPES[i],
        date: daysFromNow(i === 0 ? 0 : i - 2),
        startTime: `${10 + i}:00`,
        endTime: `${11 + i}:00`,
        priority: i === 0 ? 'URGENT' : 'NORMAL',
        status: i === 5 ? 'DONE' : 'ACTIVE',
        notes: 'Événement de démonstration seed.',
      },
    });
    counts.calendarEvents++;
  }

  const chantierEntries = [
    {
      title: 'Visite chantier n°1',
      description: 'Première visite — implantation validée.',
      progress: 10,
      issues: null,
      nextSteps: 'Contrôle fondations semaine prochaine.',
    },
    {
      title: 'Contrôle fondations',
      description: 'Fondations conformes au plan.',
      progress: 25,
      issues: 'Légère correction armatures angle sud.',
      nextSteps: 'Reprise béton prévue demain.',
    },
    {
      title: 'Vérification gros œuvre',
      description: 'Élévation RDC terminée.',
      progress: 45,
      issues: null,
      nextSteps: 'Passage étage.',
    },
    {
      title: 'Observation façade',
      description: 'Pose menuiserie aluminium en cours.',
      progress: 60,
      issues: 'Retard fournisseur menuiserie 5 jours.',
      nextSteps: 'Relance fournisseur.',
    },
  ];

  for (let i = 0; i < chantierEntries.length; i++) {
    const entry = chantierEntries[i];
    await prisma.chantierLog.create({
      data: {
        id: id(key, `chantier_${i + 1}`),
        projectId: projectIds[4],
        date: daysAgo(20 - i * 5),
        description: `${entry.title} — ${entry.description}`,
        progress: entry.progress,
        issues: entry.issues,
        nextSteps: entry.nextSteps,
        photos: [`/demo/chantier/photo-${i + 1}.jpg`],
      },
    });
    counts.chantierLogs++;
  }

  const projectDocs = [
    { name: 'Contrat_Villa_Panorama.pdf', category: 'CONTRAT', mime: 'application/pdf' },
    { name: 'Autorisation_Commune.pdf', category: 'ADMIN', mime: 'application/pdf' },
    { name: 'CPS_Villa.pdf', category: 'CPS', mime: 'application/pdf' },
    { name: 'BPU_Lot_Architecture.xlsx', category: 'BPU', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { name: 'Notice_Technique.docx', category: 'TECHNIQUE', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { name: 'Plan_Masse.dwg', category: 'PLAN', mime: 'application/acad' },
  ];
  const clientDocs = [
    { name: 'CIN_Client.pdf', docType: 'IDENTITE' },
    { name: 'Contrat_Client.pdf', docType: 'CONTRAT' },
    { name: 'Autorisation_Client.pdf', docType: 'ADMIN' },
  ];
  const unclassifiedDocs = [
    { name: 'Modele_Courrier.docx', category: 'TEMPLATE' },
    { name: 'Reference_Administratif.pdf', category: 'ADMIN' },
  ];

  for (let i = 0; i < projectDocs.length; i++) {
    const doc = projectDocs[i];
    await prisma.document.create({
      data: {
        id: id(key, `doc_proj_${i + 1}`),
        studioId: config.id,
        projectId: projectIds[i % projectIds.length],
        name: doc.name,
        originalName: doc.name,
        type: doc.category,
        category: doc.category,
        mimeType: doc.mime,
        size: 120000 + i * 15000,
        url: `/demo/documents/${doc.name}`,
        tags: ['demo', 'projet'],
        description: `Document projet — ${doc.name}`,
      },
    });
    counts.documents++;
  }

  for (let i = 0; i < clientDocs.length; i++) {
    const doc = clientDocs[i];
    await prisma.clientDocument.create({
      data: {
        id: id(key, `client_doc_${i + 1}`),
        clientId: clientIds[i],
        name: doc.name,
        url: `/demo/documents/${doc.name}`,
        mimeType: 'application/pdf',
        size: 85000,
        docType: doc.docType,
      },
    });
    await prisma.document.create({
      data: {
        id: id(key, `doc_client_${i + 1}`),
        studioId: config.id,
        clientId: clientIds[i],
        name: doc.name,
        originalName: doc.name,
        type: 'CLIENT',
        category: 'CLIENT',
        mimeType: 'application/pdf',
        size: 85000,
        url: `/demo/documents/${doc.name}`,
        tags: ['demo', 'client'],
      },
    });
    counts.documents++;
  }

  for (let i = 0; i < unclassifiedDocs.length; i++) {
    const doc = unclassifiedDocs[i];
    await prisma.document.create({
      data: {
        id: id(key, `doc_misc_${i + 1}`),
        studioId: config.id,
        name: doc.name,
        originalName: doc.name,
        type: 'OTHER',
        category: doc.category,
        mimeType: doc.name.endsWith('.pdf')
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 45000,
        url: `/demo/documents/${doc.name}`,
        tags: ['demo', 'interne'],
      },
    });
    counts.documents++;
  }

  const plans = [
    { name: 'Plan RDC', kind: 'PLAN', category: 'PLAN', version: 'V1', mime: 'application/pdf' },
    { name: 'Plan étage', kind: 'PLAN', category: 'PLAN', version: 'V2', mime: 'application/pdf' },
    { name: 'Plan toiture', kind: 'PLAN', category: 'PLAN', version: 'V1', mime: 'application/pdf' },
    { name: 'Plan de masse', kind: 'PLAN', category: 'PLAN', version: 'DCE V1', mime: 'application/pdf' },
    { name: 'Façade principale', kind: 'PLAN', category: 'FACADE', version: 'V2', mime: 'image/jpeg' },
    { name: 'Coupe AA', kind: 'PLAN', category: 'COUPE', version: 'V1', mime: 'application/pdf' },
    { name: 'Plan technique', kind: 'PLAN', category: 'TECHNIQUE', version: 'DCE V2', mime: 'application/acad' },
  ];
  const renders = [
    { name: 'Rendu extérieur', kind: 'RENDER', category: 'EXTERIEUR', isMain: true },
    { name: 'Rendu intérieur salon', kind: 'RENDER', category: 'INTERIEUR', isMain: false },
    { name: 'Perspective façade', kind: 'RENDER', category: 'FACADE', isMain: false },
    { name: 'Vue piscine', kind: 'RENDER', category: 'EXTERIEUR', isMain: false },
    { name: 'Rendu final client', kind: 'RENDER', category: 'PRESENTATION', isMain: false },
  ];

  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    await prisma.planRender.create({
      data: {
        id: id(key, `plan_${i + 1}`),
        studioId: config.id,
        projectId: projectIds[i % 3],
        name: plan.name,
        kind: plan.kind,
        category: plan.category,
        mimeType: plan.mime,
        fileType: plan.mime.includes('pdf') ? 'PDF' : plan.mime.includes('jpeg') ? 'IMAGE' : 'CAD',
        size: 200000 + i * 10000,
        url: `/demo/plans/${plan.name.replace(/\s+/g, '_').toLowerCase()}.${plan.mime.includes('jpeg') ? 'jpg' : plan.mime.includes('acad') ? 'dwg' : 'pdf'}`,
        version: plan.version,
        isFavorite: i === 0,
      },
    });
    counts.planRenders++;
  }

  for (let i = 0; i < renders.length; i++) {
    const render = renders[i];
    const url = `/demo/renders/render-${i + 1}.jpg`;
    await prisma.planRender.create({
      data: {
        id: id(key, `render_${i + 1}`),
        studioId: config.id,
        projectId: projectIds[0],
        name: render.name,
        kind: render.kind,
        category: render.category,
        mimeType: 'image/jpeg',
        fileType: 'IMAGE',
        size: 350000,
        url,
        thumbnailUrl: url,
        isMainImage: render.isMain,
        isFavorite: i === 0,
      },
    });
    counts.planRenders++;
    if (render.isMain && projectIds[0]) {
      await prisma.project.update({
        where: { id: projectIds[0] },
        data: { imageUrl: url },
      });
    }
  }

  const devisRecords: { id: string; number: string; projectIndex: number; clientIndex: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const number = devisNumber(config.financeNumberOffset, i + 1);
    const itemsSlice = DEVIS_ITEMS.slice(i, i + 4);
    const { lines, totalHT, totalTTC } = calcFinanceTotals(itemsSlice, 20);
    const devisId = id(key, `devis_${i + 1}`);
    await prisma.devis.create({
      data: {
        id: devisId,
        number,
        status: DEVIS_STATUSES[i],
        clientId: clientIds[i % clientIds.length],
        projectId: projectIds[i],
        object: `Honoraires — ${PROJECTS_TEMPLATE[i].name}`,
        paymentTerms: PAYMENT_TERMS,
        validUntil: daysFromNow(30),
        tva: 20,
        totalHT,
        totalTTC,
        createdAt: daysAgo(20 - i * 3),
        items: {
          create: lines.map((line, order) => ({
            description: itemsSlice[order].description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            total: line.total,
            order,
          })),
        },
      },
    });
    devisRecords.push({
      id: devisId,
      number,
      projectIndex: i,
      clientIndex: i % clientIds.length,
    });
    counts.devis++;
  }

  const invoiceRecords: {
    id: string;
    number: string;
    status: (typeof INVOICE_STATUSES)[number];
    totalTTC: number;
    devisId?: string;
    projectIndex: number;
    clientIndex: number;
  }[] = [];

  for (let i = 0; i < 4; i++) {
    const number = invoiceNumber(config.financeNumberOffset, i + 1);
    const itemsSlice = DEVIS_ITEMS.slice(i, i + 3);
    const { lines, totalHT, totalTTC } = calcFinanceTotals(itemsSlice, 20);
    const status = INVOICE_STATUSES[i];
    const devisId = i === 0 ? devisRecords[0].id : i === 1 ? devisRecords[1].id : undefined;
    const paidAmount =
      status === 'PAID' ? totalTTC : status === 'PARTIAL' ? Math.round(totalTTC * 0.4) : 0;

    const invoiceId = id(key, `invoice_${i + 1}`);
    await prisma.invoice.create({
      data: {
        id: invoiceId,
        number,
        status,
        clientId: clientIds[i % clientIds.length],
        projectId: projectIds[i],
        devisId,
        object: `Note d'honoraires — ${PROJECTS_TEMPLATE[i].name}`,
        tva: 20,
        totalHT,
        totalTTC,
        paidAmount,
        issueDate: daysAgo(15 - i * 2),
        dueDate: daysFromNow(status === 'OVERDUE' ? -10 : 15),
        paymentMethod: i % 2 === 0 ? 'VIREMENT' : 'CHEQUE',
        bankTransferBy: i % 2 === 0 ? 'Attijariwafa Bank' : undefined,
        notes: 'Facture de démonstration seed.',
        items: {
          create: lines.map((line, order) => ({
            description: itemsSlice[order].description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            total: line.total,
            order,
          })),
        },
      },
    });
    invoiceRecords.push({
      id: invoiceId,
      number,
      status,
      totalTTC,
      devisId,
      projectIndex: i,
      clientIndex: i % clientIds.length,
    });
    counts.invoices++;
  }

  const paymentDefs = [
    {
      suffix: 'pay_1',
      invoiceIndex: 0,
      amount: null as number | null,
      method: 'VIREMENT' as PaymentMethod,
      reference: 'VIR-2026-001',
      note: 'Paiement complet facture',
      daysAgo: 5,
    },
    {
      suffix: 'pay_2',
      invoiceIndex: 1,
      amount: null as number | null,
      method: 'CHEQUE' as PaymentMethod,
      reference: 'CHQ-4582',
      note: 'Acompte 40%',
      daysAgo: 3,
    },
    {
      suffix: 'pay_3',
      invoiceIndex: null,
      amount: 4000,
      method: 'ESPECES' as PaymentMethod,
      reference: 'ESP-2026-01',
      note: 'Paiement espèces sans facture',
      daysAgo: 1,
    },
    {
      suffix: 'pay_4',
      invoiceIndex: 1,
      amount: null as number | null,
      method: 'VIREMENT' as PaymentMethod,
      reference: 'VIR-2026-002',
      note: 'Second virement partiel',
      daysAgo: 1,
    },
  ];

  for (const pay of paymentDefs) {
    const invoice =
      pay.invoiceIndex !== null ? invoiceRecords[pay.invoiceIndex] : null;
    const amount =
      pay.amount ??
      (invoice
        ? pay.suffix === 'pay_2'
          ? Math.round(invoice.totalTTC * 0.4)
          : pay.suffix === 'pay_4'
            ? Math.round(invoice.totalTTC * 0.2)
            : invoice.totalTTC
        : 4000);

    await prisma.payment.create({
      data: {
        id: id(key, pay.suffix),
        invoiceId: invoice?.id,
        clientId: clientIds[invoice?.clientIndex ?? 0],
        projectId: projectIds[invoice?.projectIndex ?? 0],
        amount,
        date: daysAgo(pay.daysAgo),
        method: pay.method,
        reference: pay.reference,
        notes: pay.note,
        proofUrl: `/demo/payments/${pay.reference}.pdf`,
      },
    });
    counts.payments++;
  }

  const activityEntries = [
    { action: 'project_created', entity: 'project', projectIndex: 0, daysAgo: 0, detail: 'Villa Panorama créé' },
    { action: 'project_updated', entity: 'project', projectIndex: 0, daysAgo: 1, detail: 'Progression mise à jour' },
    { action: 'document_added', entity: 'document', projectIndex: 0, daysAgo: 2, detail: 'Contrat_Villa_Panorama.pdf ajouté' },
    { action: 'plan_added', entity: 'plan_render', projectIndex: 0, daysAgo: 3, detail: 'Plan RDC V2 ajouté' },
    { action: 'render_added', entity: 'plan_render', projectIndex: 0, daysAgo: 3, detail: 'Rendu extérieur ajouté' },
    { action: 'task_completed', entity: 'task', projectIndex: 1, daysAgo: 0, detail: 'Préparer plan RDC terminée' },
    { action: 'devis_created', entity: 'devis', projectIndex: 0, daysAgo: 5, detail: `${devisRecords[0].number} créé` },
    { action: 'devis_accepted', entity: 'devis', projectIndex: 0, daysAgo: 4, detail: `${devisRecords[0].number} accepté` },
    { action: 'invoice_created', entity: 'invoice', projectIndex: 0, daysAgo: 5, detail: `${invoiceRecords[0].number} générée` },
    { action: 'payment_received', entity: 'payment', projectIndex: 0, daysAgo: 5, detail: 'Paiement de 4 000 MAD reçu' },
    { action: 'meeting_added', entity: 'meeting', projectIndex: 1, daysAgo: 1, detail: 'Présentation APS ajoutée' },
    { action: 'chantier_added', entity: 'chantier', projectIndex: 4, daysAgo: 14, detail: 'Visite chantier ajoutée' },
  ];

  for (let i = 0; i < activityEntries.length; i++) {
    const entry = activityEntries[i];
    await prisma.activityLog.create({
      data: {
        id: id(key, `activity_${i + 1}`),
        userId: ownerId,
        projectId: projectIds[entry.projectIndex],
        clientId: clientIds[entry.projectIndex % clientIds.length],
        action: entry.action,
        entity: entry.entity,
        details: { message: entry.detail },
        createdAt: daysAgo(entry.daysAgo),
      },
    });
    counts.activityLogs++;
  }

  const notifDefs = [
    { type: NOTIF_TYPES[0], title: 'Deadline aujourd\'hui', message: 'Remise dossier DCE — Villa Panorama', read: false, key: 'deadline_today', link: '/calendar' },
    { type: NOTIF_TYPES[1], title: 'Tâche du jour', message: 'Préparer plan RDC à traiter', read: false, key: 'task_today', link: '/tasks' },
    { type: NOTIF_TYPES[2], title: 'Facture en retard', message: `${invoiceRecords[3].number} en retard`, read: true, key: 'invoice_overdue', link: '/finances/quotes-invoices' },
    { type: NOTIF_TYPES[3], title: 'Paiement reçu', message: 'Virement reçu — 4 000 MAD', read: true, key: 'payment_received', link: '/payments' },
    { type: NOTIF_TYPES[4], title: 'Document ajouté', message: 'Contrat_Villa_Panorama.pdf', read: false, key: 'document_added', link: '/documents' },
  ];

  for (let i = 0; i < notifDefs.length; i++) {
    const n = notifDefs[i];
    await prisma.notification.create({
      data: {
        id: id(key, `notif_${i + 1}`),
        userId: ownerId,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        uniqueKey: `${config.id}_${n.key}`,
        link: n.link,
        createdAt: daysAgo(i),
      },
    });
    counts.notifications++;
  }

  await prisma.tender.create({
    data: {
      id: id(key, 'tender_1'),
      studioId: config.id,
      name: 'Appel d\'offres — Lotissement Al Baraka',
      client: 'Commune de Tanger',
      budget: 1500000,
      deadline: daysFromNow(45),
      status: 'OPEN',
      probability: 60,
      notes: 'Dossier AO en préparation.',
    },
  });
}

async function main() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const config of STUDIO_CONFIGS) {
    await upsertCoreStudio(config, password);
    counts.studios++;

    const owner = await prisma.user.findUniqueOrThrow({
      where: { email: config.email },
    });

    await seedStudioDemo(config, owner.id);
  }

  console.log('\n✅ Seed completed\n');
  console.log('Comptes de test :');
  console.log(`  admin@amini.architects / ${DEMO_PASSWORD}`);
  console.log(`  admin@maouni.architecture / ${DEMO_PASSWORD}`);
  console.log('\nRésumé des données :');
  console.log(`  Studios        : ${counts.studios}`);
  console.log(`  Clients        : ${counts.clients}`);
  console.log(`  Projets        : ${counts.projects}`);
  console.log(`  Documents      : ${counts.documents}`);
  console.log(`  Plans & rendus : ${counts.planRenders}`);
  console.log(`  Devis          : ${counts.devis}`);
  console.log(`  Factures       : ${counts.invoices}`);
  console.log(`  Paiements      : ${counts.payments}`);
  console.log(`  Tâches         : ${counts.tasks}`);
  console.log(`  Deadlines      : ${counts.deadlines}`);
  console.log(`  Réunions       : ${counts.meetings}`);
  console.log(`  Calendrier     : ${counts.calendarEvents}`);
  console.log(`  Chantier       : ${counts.chantierLogs}`);
  console.log(`  Notifications  : ${counts.notifications}`);
  console.log(`  Activités      : ${counts.activityLogs}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
