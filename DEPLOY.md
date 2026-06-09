# Déploiement VPS + domaine

Guide pour déployer **Architecture Studio** sur un VPS avec Docker, Nginx et HTTPS (Let's Encrypt).

## Comptes créés au premier seed

| Studio | Email | Mot de passe initial |
|--------|-------|----------------------|
| Amini Architects | `admin@amini.architects` | `Archi2026!` |
| Maouni Architecture | `admin@maouni.architecture` | `Archi2026!` |

Les administrateurs peuvent ensuite changer email et mot de passe dans **Paramètres → Profil / Sécurité**.

---

## Ce dont j'ai besoin pour vous accompagner

Envoyez-moi (en privé, jamais dans un chat public) :

1. **Nom de domaine** — ex. `app.ma-architecture.ma`
2. **IP du VPS**
3. **OS du VPS** — Ubuntu 22.04 ou 24.04 recommandé
4. **Accès SSH** — utilisateur + clé ou mot de passe (si vous voulez que je configure à distance)
5. **Email admin** — pour les certificats Let's Encrypt (ex. `admin@ma-architecture.ma`)
6. **Registrar DNS** — où gérer les enregistrements DNS (OVH, Cloudflare, etc.)

---

## Prérequis VPS

- Ubuntu 22.04+ (ou Debian équivalent)
- 2 Go RAM minimum (4 Go recommandé — Puppeteer PDF)
- Ports **80** et **443** ouverts
- Nom de domaine pointant vers l'IP du VPS :

```
Type A    @              → IP_DU_VPS
Type A    www            → IP_DU_VPS   (optionnel)
```

---

## Étape 1 — Préparer le serveur

```bash
ssh root@IP_DU_VPS

apt update && apt upgrade -y
apt install -y git curl

# Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER
# Se reconnecter pour appliquer le groupe docker
```

---

## Étape 2 — Cloner le projet

```bash
cd /opt
git clone https://github.com/VOTRE_ORG/architecture-studio.git
cd architecture-studio
```

---

## Étape 3 — Fichier `.env` production

```bash
cp .env.production.example .env
nano .env
```

Exemple pour le domaine `app.example.com` :

```env
DOMAIN=app.example.com
CORS_ORIGIN=https://app.example.com
NEXT_PUBLIC_API_URL=https://app.example.com/api

POSTGRES_DB=architecture_db
POSTGRES_USER=architecture
POSTGRES_PASSWORD=VOTRE_MOT_DE_PASSE_DB

JWT_SECRET=VOTRE_SECRET_JWT_ALEATOIRE
JWT_EXPIRES_IN=7d
REGISTER_INVITE_CODE=ARCHI2026
```

Générer des secrets :

```bash
openssl rand -base64 48   # pour JWT_SECRET
openssl rand -base64 32   # pour POSTGRES_PASSWORD
```

---

## Étape 4 — Configurer Nginx (domaine)

Remplacer `VOTRE_DOMAINE.com` dans les fichiers nginx :

```bash
export DOMAIN=app.example.com
sed "s/VOTRE_DOMAINE.com/$DOMAIN/g" deploy/nginx.conf > deploy/nginx.conf.tmp && mv deploy/nginx.conf.tmp deploy/nginx.conf
```

---

## Étape 5 — Premier démarrage (HTTP)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Vérifier : `http://VOTRE_DOMAINE.com` doit afficher la page de login.

---

## Étape 6 — Créer les comptes admin (une seule fois)

```bash
docker compose -f docker-compose.prod.yml exec backend node prisma/seed.prod.js
```

> Ne relancez pas ce seed après que les admins ont changé leur mot de passe — il ne réinitialise pas les mots de passe existants, mais évitez de supprimer/recréer les comptes inutilement.

---

## Étape 7 — Certificat SSL (HTTPS)

```bash
export DOMAIN=app.example.com
export EMAIL=admin@example.com

docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d $DOMAIN \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email
```

Activer la config HTTPS :

```bash
sed "s/VOTRE_DOMAINE.com/$DOMAIN/g" deploy/nginx.ssl.conf > deploy/nginx.conf
docker compose -f docker-compose.prod.yml restart nginx
```

Renouvellement automatique (cron sur le VPS) :

```bash
echo "0 3 * * * cd /opt/architecture-studio && docker compose -f docker-compose.prod.yml run --rm certbot renew && docker compose -f docker-compose.prod.yml restart nginx" | crontab -
```

---

## Étape 8 — Vérifications

- [ ] `https://VOTRE_DOMAINE.com` — page login
- [ ] Connexion `admin@amini.architects` / `Archi2026!`
- [ ] Connexion `admin@maouni.architecture` / `Archi2026!`
- [ ] Upload document / logo fonctionne
- [ ] Génération PDF devis/facture

---

## Mises à jour

```bash
cd /opt/architecture-studio
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Les migrations Prisma s'appliquent automatiquement au redémarrage du backend.

---

## Sauvegardes

```bash
# Base de données
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U architecture architecture_db > backup-$(date +%F).sql

# Fichiers uploadés
docker run --rm -v architecture-studio_uploads_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Frontend ne joint pas l'API | Vérifier `NEXT_PUBLIC_API_URL` dans `.env` **avant** `docker compose build` |
| Erreur CORS | `CORS_ORIGIN` doit être exactement `https://votre-domaine.com` |
| 502 Bad Gateway | `docker compose -f docker-compose.prod.yml logs backend frontend` |
| PDF ne se génère pas | Vérifier Chromium dans le conteneur backend (logs) |

---

## Développement local (seed)

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

Le seed local crée uniquement les 2 studios + 2 comptes admin (sans données de démo).
