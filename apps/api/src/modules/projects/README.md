# Module Projets & Services

Numérotation unique (`PROD-2026-045`), workflow Devis → Validé → En cours → Révision → Livré → Facturé → Archivé (voir section 4.2).

## Endpoints

- `GET /api/projects` — liste paginée, recherche, filtre par statut/client. Permission `PROJECTS:READ`.
- `GET /api/projects/:id` — détail. Permission `PROJECTS:READ`.
- `POST /api/projects` — création (génère la référence `PROD-AAAA-NNN`). Permission `PROJECTS:CREATE`.
- `PUT /api/projects/:id` — modification des champs. Permission `PROJECTS:UPDATE`.
- `POST /api/projects/:id/transition` — changement de statut, transitions validées par [project-workflow.ts](./project-workflow.ts). Passer au statut "Validé" exige spécifiquement la permission `PROJECTS:VALIDATE` (ex. réservée au rôle producteur), même si l'appelant a `PROJECTS:UPDATE`.
- `DELETE /api/projects/:id` — suppression. Permission `PROJECTS:DELETE`.

## Modèle de données

`Project` : référence, titre, client lié, type de service, statut, description, budget (montant + devise), dates de début/échéance.

## État

Implémenté : CRUD complet, machine à états du workflow avec tests unitaires, numérotation automatique.

À faire (évolutions futures) : versioning des livrables, checklists/sous-tâches, timeline Gantt, annotations sur forme d'onde, pièces jointes.
