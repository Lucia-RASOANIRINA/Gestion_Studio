# Gestion Studio

Plateforme de gestion de services pour une maison de production audio basée à Madagascar (enregistrement, mixage, mastering, post-production, location de matériel, prestations live).

## Stack technique

- **Backend** : Node.js + Express (TypeScript), architecture modulaire par domaine
- **Frontend** : Angular (TypeScript), thème sombre, TailwindCSS
- **Base de données** : PostgreSQL + Prisma ORM
- **Cache / files d'attente** : Redis
- **Stockage fichiers** : MinIO (compatible S3) en local/dev
- **Monorepo** : npm workspaces (`apps/api`, `apps/web`, `packages/shared`)

## Architecture

```
gestion_studio/
├── apps/
│   ├── api/        # Backend Express + Prisma
│   └── web/        # Frontend Angular
├── packages/
│   └── shared/     # Types et constantes partagés front/back
├── docker-compose.yml
└── .env.example
```

## Démarrage

1. Copier les variables d'environnement :
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Démarrer les services (PostgreSQL, Redis, MinIO) :
   ```bash
   npm run db:up
   ```
4. Générer le client Prisma et appliquer les migrations :
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
5. Lancer le backend et le frontend (dans deux terminaux) :
   ```bash
   npm run dev:api
   npm run dev:web
   ```
6. Ouvrir [http://localhost:4200](http://localhost:4200)

## État du projet

Scaffolding initial : structure des modules pour l'ensemble des phases fonctionnelles (clients, projets, planning, ressources, facturation, reporting, paramètres), sans logique métier. Voir [CHANGELOG.md](CHANGELOG.md) pour le détail.

Chaque module possède son propre `README.md` documentant sa portée et son état d'avancement.
