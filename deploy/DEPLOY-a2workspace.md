# Déploiement — a2workspace.studio

| Paramètre | Valeur |
|-----------|--------|
| Domaine | `a2workspace.studio` |
| IP VPS | `51.77.195.129` |
| OS | Ubuntu 25.04 |

---

## 1. DNS (chez votre registrar)

Créer ces enregistrements **avant** le déploiement :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | `@` | `51.77.195.129` | 300 |
| A | `www` | `51.77.195.129` | 300 |

Vérifier (depuis votre PC) :

```bash
ping a2workspace.studio
# doit répondre depuis 51.77.195.129
```

---

## 2. Connexion au VPS

```bash
ssh root@51.77.195.129
# ou : ssh votre_utilisateur@51.77.195.129
```

---

## 3. Installer Docker (Ubuntu 25.04)

```bash
apt update && apt upgrade -y
apt install -y git curl

curl -fsSL https://get.docker.com | sh
```

---

## 4. Récupérer le projet

```bash
cd /opt
git clone https://github.com/VOTRE_COMPTE/architecture-studio.git
cd architecture-studio
```

> Remplacez l'URL par votre dépôt Git réel. Sinon, transférez le projet via `scp` :

```bash
# Depuis votre PC Windows (PowerShell) :
scp -r C:\Users\admin\architecture-studio root@51.77.195.129:/opt/architecture-studio
```

---

## 5. Fichier `.env` production

```bash
cd /opt/architecture-studio
cp .env.production.example .env

# Générer les secrets
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 48)"
```

Éditer `.env` et coller les secrets générés :

```bash
nano .env
```

Contenu attendu :

```env
DOMAIN=a2workspace.studio
CORS_ORIGIN=http://a2workspace.studio,https://a2workspace.studio
NEXT_PUBLIC_API_URL=https://a2workspace.studio/api

POSTGRES_DB=architecture_db
POSTGRES_USER=architecture
POSTGRES_PASSWORD=<secret généré>

JWT_SECRET=<secret généré>
JWT_EXPIRES_IN=7d
REGISTER_INVITE_CODE=ARCHI2026
```

---

## 6. Lancer l'application (HTTP)

> **Si le build Docker échoue** : faites `git pull` pour récupérer les correctifs (Suspense, ESLint build, lock files). Ne lancez pas `npm install` sur le VPS sauf pour régénérer le lock — le build se fait dans Docker.

### Option A — docker-compose.yml + Nginx système (votre setup actuel)

```bash
# .env — exemple
CORS_ORIGIN=http://a2workspace.studio,https://a2workspace.studio
NEXT_PUBLIC_API_URL=http://a2workspace.studio/api
JWT_SECRET=<openssl rand -base64 48>
DATABASE_URL=postgresql://architecture:architecture_password@postgres:5432/architecture_db

# Éviter conflit port 3000 (autre app Docker)
sed -i 's/"3000:3000"/"3002:3000"/g' docker-compose.yml

docker compose up -d --build
# Crée/renouvelle uniquement Demo 1, Demo 2 et Demo 3.
# Ne lancez pas seed.prod.js ni prisma db seed sur une base déjà utilisée.
docker compose exec backend npm run prisma:seed-demo

# Nginx système → Docker
sudo cp deploy/nginx-host-docker.conf /etc/nginx/sites-available/a2workspace.studio
sudo ln -sf /etc/nginx/sites-available/a2workspace.studio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option B — docker-compose.prod.yml (tout dans Docker + SSL)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Attendre 2–5 min (build frontend + backend). Puis :

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f --tail=50
```

Tester : **http://a2workspace.studio** → page de connexion.

---

## 7. Créer ou renouveler uniquement les comptes démo

```bash
docker compose -f docker-compose.prod.yml exec backend npm run prisma:seed-demo
```

Cette commande ne modifie pas les studios, paramètres, utilisateurs ou données
d’Amini et Maouni. Elle crée ou remplit uniquement les trois studios démo et
renouvelle leur expiration à 14 jours.

- `demo1@archi.studio` / `Demo2026!`
- `demo2@archi.studio` / `Demo2026!`
- `demo3@archi.studio` / `Demo2026!`

> Ne lancez pas `node prisma/seed.prod.js`, `npx prisma db seed` ou
> `prisma migrate reset` sur la base de production existante.

---

## 8. HTTPS (Let's Encrypt)

Remplacez `VOTRE_EMAIL` par votre email (ex. `admin@a2workspace.studio`) :

```bash
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d a2workspace.studio \
  -d www.a2workspace.studio \
  --email VOTRE_EMAIL \
  --agree-tos \
  --no-eff-email
```

Activer HTTPS :

```bash
cp deploy/nginx.ssl.conf deploy/nginx.conf
docker compose -f docker-compose.prod.yml restart nginx
```

Tester : **https://a2workspace.studio**

Renouvellement auto (cron) :

```bash
(crontab -l 2>/dev/null; echo "0 3 * * * cd /opt/architecture-studio && docker compose -f docker-compose.prod.yml run --rm certbot renew && docker compose -f docker-compose.prod.yml restart nginx") | crontab -
```

---

## 9. Firewall (recommandé)

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

---

## Mise à jour

```bash
cd /opt/architecture-studio
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Dépannage

```bash
# Logs
docker compose -f docker-compose.prod.yml logs backend --tail=100
docker compose -f docker-compose.prod.yml logs frontend --tail=100
docker compose -f docker-compose.prod.yml logs nginx --tail=50

# Redémarrer tout
docker compose -f docker-compose.prod.yml restart

# État des conteneurs
docker compose -f docker-compose.prod.yml ps
```

| Problème | Cause probable |
|----------|----------------|
| Site inaccessible | DNS pas propagé, ou ports 80/443 fermés |
| 502 Bad Gateway | Backend pas démarré — voir logs backend |
| CORS / API erreur | Rebuild frontend après changement de `NEXT_PUBLIC_API_URL` |
| Certificat SSL échoue | DNS doit pointer vers 51.77.195.129 avant certbot |

---

## Encore besoin d'aide ?

Envoyez en privé :

- URL du dépôt Git (si clone)
- Email pour Let's Encrypt
- Sortie de `docker compose -f docker-compose.prod.yml logs --tail=80` en cas d'erreur
