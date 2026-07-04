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

### Notes techniques
- Le port hôte PostgreSQL par défaut est `5433` (et non `5432`) car un PostgreSQL natif préexistant sur la machine de développement occupait déjà le 5432. Voir `docker-compose.yml` / `.env.example`.
