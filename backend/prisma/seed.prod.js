require('dotenv/config');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const STUDIOS = [
  {
    id: 'studio_amini',
    slug: 'amini',
    name: 'Amini Architects',
    logoUrl: '/studios/amini.png',
    email: 'admin@amini.architects',
    adminName: 'Amini Admin',
    settingsId: 'settings_amini',
  },
  {
    id: 'studio_maouni',
    slug: 'maouni',
    name: 'Maouni Architecture',
    logoUrl: '/studios/maouni.png',
    email: 'admin@maouni.architecture',
    adminName: 'Maouni Admin',
    settingsId: 'settings_maouni',
  },
];

async function main() {
  const password = await bcrypt.hash('Archi2026!', 12);

  for (const studio of STUDIOS) {
    await pool.query(
      `INSERT INTO "Studio" ("id", "slug", "name", "logoUrl", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT ("slug") DO UPDATE SET "name" = $3, "logoUrl" = $4, "updatedAt" = NOW()`,
      [studio.id, studio.slug, studio.name, studio.logoUrl],
    );

    await pool.query(
      `INSERT INTO "Settings" ("id", "studioId", "cabinetName", "cabinetLogo", "tvaDefault", "invoicePrefix", "devisPrefix", "updatedAt")
       VALUES ($1, $2, $3, $4, 20, 'FAC', 'DEV', NOW())
       ON CONFLICT ("studioId") DO UPDATE SET "cabinetName" = $3, "cabinetLogo" = $4, "updatedAt" = NOW()`,
      [studio.settingsId, studio.id, studio.name, studio.logoUrl],
    );

    const hash = password;
    await pool.query(
      `INSERT INTO "User" ("id", "email", "name", "password", "role", "studioId", "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, 'OWNER', $4, NOW())
       ON CONFLICT ("email") DO UPDATE SET "name" = $2, "role" = 'OWNER', "studioId" = $4`,
      [studio.email, studio.adminName, hash, studio.id],
    );
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
