# Gestion Studio — API

Backend Express + TypeScript, architecture modulaire par domaine, Prisma/PostgreSQL, RBAC granulaire stocké en base, i18n FR/EN, audit log.

## Structure

```
src/
├── config/       # env, prisma, i18n
├── common/       # middlewares (auth, rbac, erreurs, validation), audit
├── modules/
│   ├── auth/       # implémenté (login, refresh, logout, verrouillage de compte)
│   ├── users/      # implémenté (lecture seule)
│   ├── clients/    # scaffolding — phase 2
│   ├── projects/   # scaffolding — phase 3
│   ├── planning/   # scaffolding — phase 4
│   ├── resources/  # scaffolding — phase 5
│   ├── billing/    # scaffolding — phase 6
│   ├── reporting/  # scaffolding — phase 7
│   └── settings/   # scaffolding — phase 8
├── app.ts
└── server.ts
prisma/
├── schema.prisma  # User, Role, Permission, RolePermission, RefreshToken, AuditLog
└── seed.ts        # crée les 7 rôles par défaut + un compte de démonstration par rôle
```

## Comptes de démonstration (après `npm run prisma:seed`)

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

⚠️ À changer immédiatement en production.

## Commandes

```bash
npm run dev              # démarre l'API en watch mode (tsx)
npm run prisma:generate  # génère le client Prisma
npm run prisma:migrate   # applique les migrations
npm run prisma:seed      # crée les rôles + comptes de démonstration
npm test                 # tests unitaires (Jest)
```
