# Architecture Studio

Application interne de gestion pour cabinet d'architecture — projets, clients, documents, tâches, deadlines, devis, factures, paiements et notifications.

## Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Zustand, React Query
- **Backend:** NestJS, Prisma ORM, PostgreSQL, JWT Auth
- **Infra:** Docker Compose

## Démarrage rapide (Docker)

```bash
cp .env.example .env
# Éditer JWT_SECRET dans .env

docker compose up --build
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000        |
| Backend   | http://localhost:3001/api    |
| PostgreSQL| localhost:5435               |

### Comptes admin (2 studios réels — permanents)

| Studio | Email | Mot de passe |
|--------|-------|--------------|
| **Amini Architects** | `admin@amini.architects` | `Archi2026!` |
| **Maouni Architecture** | `admin@maouni.architecture` | `Archi2026!` |

Chaque compte a son propre dashboard, logo et données isolées. Les admins peuvent changer email et mot de passe dans Paramètres. **Aucune expiration** sur ces studios.

### Comptes démo (3 studios isolés — expire après 14 jours)

Données fictives très remplies pour présentation client. **Séparés** d’Amini/Maouni (aucune donnée réelle partagée). En production, exécuter uniquement `npm run prisma:seed-demo` pour créer ou renouveler les démos sans modifier les comptes réels.

| Studio | Email | Mot de passe |
|--------|-------|--------------|
| **Demo 1** | `demo1@archi.studio` | `Demo2026!` |
| **Demo 2** | `demo2@archi.studio` | `Demo2026!` |
| **Demo 3** | `demo3@archi.studio` | `Demo2026!` |

Après expiration : message *« Ce compte démo a expiré »* au login (Amini/Maouni restent accessibles).

Le seed crée les 2 comptes réels (structure seule) **et** les 3 comptes démo riches.

## Déploiement production (VPS + domaine)

Voir **[deploy/DEPLOY-a2workspace.md](./deploy/DEPLOY-a2workspace.md)** (domaine `a2workspace.studio`) ou **[DEPLOY.md](./DEPLOY.md)** pour la procédure générique.

## Développement local

### 1. Base de données

```bash
docker compose up postgres -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # ou copier depuis la racine
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

API disponible sur http://localhost:3001/api

### 3. Frontend

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
npm install
npm run dev
```

App disponible sur http://localhost:3000

## Structure

```
architecture-studio/
├── frontend/          # Next.js 14 App Router
├── backend/           # NestJS + Prisma
├── docker-compose.yml
├── .env.example
└── README.md
```

## Modules

- **Auth** — JWT, inscription avec code invitation, rate limiting login
- **Projets & Clients** — CRUD complet avec phases et progression
- **Documents** — Upload Multer (`uploads/{type}/{projectId}/`)
- **Tâches, Deadlines, Réunions** — Gestion opérationnelle
- **Devis & Factures** — CRUD + génération PDF (Puppeteer)
- **Paiements** — Mise à jour automatique du statut facture
- **Notifications** — Cron toutes les 5 min (tâches, deadlines, factures)
- **Dashboard** — Vue d'ensemble agrégée

## Variables d'environnement

Voir `.env.example` :

| Variable              | Description                    |
|-----------------------|--------------------------------|
| DATABASE_URL          | Connexion PostgreSQL           |
| JWT_SECRET            | Secret JWT (obligatoire prod)  |
| REGISTER_INVITE_CODE  | Code inscription (défaut ARCHI2026) |
| CORS_ORIGIN           | Origine frontend autorisée     |
| NEXT_PUBLIC_API_URL   | URL API pour le frontend       |

## Design

Interface **dark premium** :
- Fond `#0A0A0F`, sidebar `#111118`, accent `#E07820`
- Cards arrondies 16px, typographie Inter
