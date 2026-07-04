# Gestion Studio — Web

Frontend Angular (standalone components), TailwindCSS avec le thème sombre du cahier des charges, i18n FR/EN via `@ngx-translate`.

## Structure

```
src/app/
├── core/
│   ├── auth/          # AuthService (login/logout, tokens en localStorage)
│   ├── guards/         # authGuard
│   ├── interceptors/   # authInterceptor (Bearer token)
│   └── i18n/           # configuration ngx-translate
├── shared/
│   └── layout/         # ShellComponent (sidebar, sélecteur de langue)
└── features/
    ├── auth/login/      # implémenté
    ├── dashboard/       # implémenté (placeholder)
    ├── clients/         # implémenté (liste, création, édition)
    ├── projects/        # implémenté (liste, création/édition + workflow)
    ├── planning/        # scaffolding — phase 4
    ├── resources/       # scaffolding — phase 5
    ├── billing/         # scaffolding — phase 6
    ├── reporting/       # scaffolding — phase 7
    └── settings/        # scaffolding — phase 8
```

## Démarrage

```bash
npm run start   # ng serve --port 4200
```

Ouvrir [http://localhost:4200](http://localhost:4200). Se connecter avec l'un des comptes de démonstration créés par `npm run prisma:seed` côté API (voir [apps/api/README.md](../api/README.md) pour la liste des comptes par rôle — mot de passe commun `ChangeMe123!`). Le seed inclut aussi 8 clients et 10 projets de démonstration.
