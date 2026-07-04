# Module Auth

Authentification email + mot de passe, JWT (access + refresh), verrouillage de compte après tentatives échouées répétées, rate limiting sur les endpoints sensibles.

## Endpoints

- `POST /api/auth/login` — connexion, retourne `accessToken` + `refreshToken`.
- `POST /api/auth/refresh` — renouvelle les tokens (rotation du refresh token).
- `POST /api/auth/logout` — révoque le refresh token fourni.

## État

Implémenté (fondation) : login, refresh, logout, verrouillage de compte (5 tentatives / 15 min), audit log sur connexion.

À faire (phases suivantes) : inscription/gestion des comptes (module `users`), 2FA TOTP.
