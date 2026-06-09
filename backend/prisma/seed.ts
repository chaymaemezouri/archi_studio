import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { DEMO_PASSWORD, STUDIO_CONFIGS, type StudioSeedConfig } from './seed-data';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

async function main() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const config of STUDIO_CONFIGS) {
    await upsertCoreStudio(config, password);
  }

  console.log('\n✅ Seed completed — comptes administrateurs uniquement\n');
  console.log('  admin@amini.architects / Archi2026!');
  console.log('  admin@maouni.architecture / Archi2026!');
  console.log('\nLes administrateurs peuvent changer email et mot de passe dans Paramètres.\n');
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
