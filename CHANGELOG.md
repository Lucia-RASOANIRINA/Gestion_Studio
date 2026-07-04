# Changelog

Toutes les évolutions notables du projet sont documentées ici.

## [Unreleased]

### Ajouté
- Structure monorepo (`apps/api`, `apps/web`, `packages/shared`).
- `docker-compose.yml` : PostgreSQL, Redis, MinIO.
- Squelette backend Express + TypeScript + Prisma, avec modules pour chaque domaine fonctionnel (auth, users, clients, projects, planning, resources, billing, reporting, settings).
- Schéma Prisma de fondation : `User`, `Role`, `Permission`, `RolePermission`.
- Squelette frontend Angular avec TailwindCSS (thème sombre), i18n FR/EN, et modules `features` pour chaque domaine fonctionnel.
- Package `packages/shared` pour les types et constantes partagés.
- Authentification fonctionnelle de bout en bout (login/logout/refresh, verrouillage de compte, audit log) avec seed d'un compte admin.
- Icônes (Lucide) sur la navigation, le tableau de bord et le formulaire de connexion.
- Interface responsive : menu latéral repliable (hamburger) sur mobile/tablette, grilles adaptatives.
- Jeu de données de démonstration enrichi : 7 rôles par défaut avec permissions dédiées + un compte utilisateur par rôle.
- **Module Clients & Contacts (phase 2) complet** : modèle Prisma `Client`, endpoints CRUD avec validation (téléphone malgache, e-mail), recherche/filtre/pagination, pages Angular (liste, création, édition) avec formulaires réactifs et messages d'erreur localisés.
- **Module Projets & Services (phase 3) complet** : modèle Prisma `Project`, numérotation automatique (`PROD-AAAA-NNN`), machine à états du workflow (Devis → Validé → En cours → Révision → Livré → Facturé → Archivé) avec tests unitaires et permission dédiée pour la validation, endpoints CRUD + transition de statut, pages Angular (liste, création/édition avec actions de workflow).
- 8 clients et 10 projets de démonstration supplémentaires (données réalistes, tous statuts et types de service représentés).

### Corrigé
- Le sous-titre du tableau de bord n'était pas traduit (texte français en dur) — utilise désormais une clé i18n.
- Les enums partagés (`ClientSegment`, `ServiceType`, `ProjectStatus`, `Currency`, `PaymentMethod`) utilisaient des valeurs en minuscules alors que les enums Prisma correspondants sont en majuscules, ce qui cassait les filtres et libellés côté frontend — alignement des valeurs.

### Notes techniques
- Le port hôte PostgreSQL par défaut est `5433` (et non `5432`) car un PostgreSQL natif préexistant sur la machine de développement occupait déjà le 5432. Voir `docker-compose.yml` / `.env.example`.
- Le port de l'API est désormais `3001` (et non `3000`) car un autre serveur de développement (projet sans rapport) occupait déjà le 3000 sur la machine de développement. Voir `.env.example`, `apps/web/src/environments/environment.ts`.
