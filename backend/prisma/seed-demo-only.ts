import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import {
  DEMO_ACCOUNT_PASSWORD,
  DEMO_EXPIRY_DAYS,
  DEMO_STUDIO_CONFIGS,
  seedDemoStudios,
} from './seed-demo';

const PROTECTED_STUDIO_SLUGS = new Set(['amini', 'maouni']);
const PROTECTED_EMAILS = new Set([
  'admin@amini.architects',
  'admin@maouni.architecture',
]);

function assertDemoConfigurationIsIsolated() {
  for (const config of DEMO_STUDIO_CONFIGS) {
    if (PROTECTED_STUDIO_SLUGS.has(config.slug)) {
      throw new Error(`Refus du seed démo : studio protégé ${config.slug}`);
    }
    if (PROTECTED_EMAILS.has(config.owner.email)) {
      throw new Error(`Refus du seed démo : email protégé ${config.owner.email}`);
    }
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  assertDemoConfigurationIsIsolated();

  const passwordHash = await bcrypt.hash(DEMO_ACCOUNT_PASSWORD, 12);
  const demos = await seedDemoStudios(prisma, passwordHash);

  console.log(
    `\nSeed démo terminé — Amini et Maouni n'ont pas été lus ni modifiés.`,
  );
  console.log(`Expiration renouvelée à ${DEMO_EXPIRY_DAYS} jours :`);
  for (const demo of demos) {
    console.log(
      `  ${demo.name}: ${demo.email} / ${DEMO_ACCOUNT_PASSWORD} — expire ${demo.expiresAt
        .toISOString()
        .slice(0, 10)}`,
    );
  }
  console.log('');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
