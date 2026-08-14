import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { DEMO_PASSWORD, STUDIO_CONFIGS, type StudioSeedConfig } from './seed-data';
import {
  DEMO_ACCOUNT_PASSWORD,
  DEMO_EXPIRY_DAYS,
  seedDemoStudios,
} from './seed-demo';

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
      // Never set demoExpiresAt on real studios
      demoExpiresAt: null,
    },
    create: {
      id: config.id,
      slug: config.slug,
      name: config.name,
      logoUrl: config.logoUrl,
      demoExpiresAt: null,
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
  const realPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
  const demoPassword = await bcrypt.hash(DEMO_ACCOUNT_PASSWORD, 12);

  for (const config of STUDIO_CONFIGS) {
    await upsertCoreStudio(config, realPassword);
  }

  const demos = await seedDemoStudios(prisma, demoPassword);

  console.log('\n✅ Seed completed\n');
  console.log('Comptes réels (permanents, sans expiration) :');
  console.log('  admin@amini.architects / Archi2026!');
  console.log('  admin@maouni.architecture / Archi2026!');
  console.log('\nComptes démo isolés (expiration ' + DEMO_EXPIRY_DAYS + ' jours) :');
  for (const demo of demos) {
    console.log(
      `  ${demo.email} / ${DEMO_ACCOUNT_PASSWORD}  — expire ${demo.expiresAt.toISOString().slice(0, 10)}`,
    );
  }
  console.log('');
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
