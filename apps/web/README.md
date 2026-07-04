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
    ├── clients/         # scaffolding — phase 2
    ├── projects/        # scaffolding — phase 3
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

Ouvrir [http://localhost:4200](http://localhost:4200). Se connecter avec le compte admin créé par `npm run prisma:seed` côté API (`admin@gestion-studio.mg` / `ChangeMe123!`).
