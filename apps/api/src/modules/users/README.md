# Module Users

Gestion des utilisateurs et de la matrice de permissions (rôles ↔ permissions), administrable sans redéploiement.

## Endpoints

- `GET /api/users` — liste des utilisateurs (permission `USERS:READ`).
- `GET /api/users/:id` — détail d'un utilisateur (permission `USERS:READ`).

## État

Scaffolding : lecture seule. À compléter : création/désactivation d'utilisateurs, assignation de rôles, gestion des permissions (CRUD sur `Role`/`Permission`), 2FA.
