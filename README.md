# Gestion Studio

Plateforme de gestion de services pour une maison de production audio basée à Madagascar (enregistrement, mixage, mastering, post-production, location de matériel, prestations live).

## Stack technique

- **Backend** : Node.js + Express (TypeScript), architecture modulaire par domaine
- **Frontend** : Angular (TypeScript), thème sombre, TailwindCSS, i18n FR/EN
- **Base de données** : PostgreSQL + Prisma ORM
- **Cache / files d'attente** : Redis
- **Stockage fichiers** : MinIO (compatible S3) en local/dev
- **Monorepo** : npm workspaces (`apps/api`, `apps/web`, `packages/shared`)

## Architecture

```
gestion_studio/
├── apps/
│   ├── api/        # Backend Express + Prisma (port 3001)
│   └── web/         # Frontend Angular (port 4200)
├── packages/
│   └── shared/      # Types et constantes partagés front/back
├── docker-compose.yml   # PostgreSQL, Redis, MinIO
└── .env.example
```

---

## Prérequis

| Outil | Version minimale | Notes |
|---|---|---|
| [Node.js](https://nodejs.org) | 20+ | inclut npm |
| [Docker Desktop](https://www.docker.com/products/docker-desktop) | récente | doit être **démarré** avant `npm run db:up` |
| Git | — | pour cloner/versionner le dépôt |

Aucune installation locale de PostgreSQL/Redis n'est nécessaire : ils tournent dans des conteneurs Docker.

---

## Démarrage pas à pas

### 1. Cloner et se placer dans le dossier du projet

```bash
git clone https://github.com/Lucia-RASOANIRINA/Gestion_Studio.git
cd Gestion_Studio
```

### 2. Copier les variables d'environnement

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

Les valeurs par défaut fonctionnent telles quelles en local — aucune modification requise pour démarrer.

### 3. Installer les dépendances (toutes les workspaces d'un coup)

```bash
npm install
```

### 4. Construire le package partagé

```bash
npm run build:shared
```

### 5. Démarrer Docker Desktop, puis lancer les services (PostgreSQL, Redis, MinIO)

```bash
npm run db:up
```

Vérifier que les conteneurs tournent : `docker ps` doit lister `gestion_studio_postgres`, `gestion_studio_redis`, `gestion_studio_minio`.

### 6. Générer le client Prisma et appliquer les migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 7. Peupler la base avec les données de démonstration

```bash
npm run prisma:seed
```

Cela crée les 7 rôles par défaut, un compte par rôle, 8 clients, 10 projets et 7 réservations de test (voir [apps/api/README.md](apps/api/README.md) pour la liste complète des comptes).

### 8. Lancer le backend et le frontend (dans deux terminaux séparés)

```bash
npm run dev:api    # http://localhost:3001
```
```bash
npm run dev:web    # http://localhost:4200
```

### 9. Ouvrir l'application

[http://localhost:4200](http://localhost:4200) — se connecter avec par exemple `admin@gestion-studio.mg` / `ChangeMe123!`.

---

## Comptes de démonstration

Mot de passe commun : `ChangeMe123!`

| Rôle | Email |
|---|---|
| Administrateur | `admin@gestion-studio.mg` |
| Producteur / Chef de projet | `producteur@gestion-studio.mg` |
| Ingénieur du son | `ingenieur@gestion-studio.mg` |
| Commercial | `commercial@gestion-studio.mg` |
| Comptabilité | `comptable@gestion-studio.mg` |
| Client externe (portail) | `client@gestion-studio.mg` |
| Freelance / Intervenant externe | `freelance@gestion-studio.mg` |

---

## Ports utilisés

| Service | Port | Variable |
|---|---|---|
| Frontend Angular | `4200` | `WEB_PORT` |
| Backend API | `3001` | `API_PORT` |
| PostgreSQL | `5433` | `DB_PORT` |
| Redis | `6379` | `REDIS_PORT` |
| MinIO (API / Console) | `9000` / `9001` | `MINIO_PORT` / `MINIO_CONSOLE_PORT` |

Les ports API (`3001`) et PostgreSQL (`5433`) ont volontairement été décalés de leurs valeurs par défaut (`3000`, `5432`) : sur la machine de développement d'origine, ces ports étaient déjà occupés par d'autres projets, ce qui provoquait des conflits silencieux (le mauvais serveur répondait aux requêtes). Si vous rencontrez des erreurs 401/404 inattendues ou des réponses qui ne ressemblent pas à l'API, vérifiez d'abord qu'aucun autre processus n'écoute sur ces ports.

---

## Tests

```bash
cd apps/api
npm test
```

Tests unitaires sur la logique métier : validation (téléphone malgache, e-mail), workflow des statuts de projet, détection de conflits de planning.

---

## Dépannage

- **`docker compose up` échoue** : Docker Desktop doit être lancé et complètement démarré avant `npm run db:up`.
- **Erreur `EPERM` pendant `prisma migrate`/`generate` sous Windows** : arrêter le serveur API (`npm run dev:api`) avant de relancer la commande Prisma — le fichier du moteur Prisma est verrouillé tant que l'API tourne.
- **Erreurs 401 inattendues alors que vous êtes connecté** : le token expire après 15 minutes ; reconnectez-vous.
- **Page blanche ou données vides** : vérifiez que l'API (`http://localhost:3001/api/health`) répond bien avant de blâmer le frontend, et qu'aucun autre service ne squatte les ports 3001/5433 (voir section Ports ci-dessus).

---

## État du projet

Implémenté et fonctionnel : **Fondations** (auth, RBAC, i18n, thème), **Clients & Contacts**, **Projets & Services** (workflow), **Planning & Réservations** (calendrier jour/semaine/mois, détection de conflits, export iCal).

Restant (pages "à venir") : Ressources, Facturation & Finances, Reporting & Analytics, Paramètres, ainsi que les fonctionnalités transverses (portail client, mode hors-ligne, notifications, 2FA, application mobile).

Voir [CHANGELOG.md](CHANGELOG.md) pour le détail des évolutions. Chaque module possède son propre `README.md` (dans `apps/api/src/modules/<module>/`) documentant sa portée et son état d'avancement.
