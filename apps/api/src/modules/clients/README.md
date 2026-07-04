# Module Clients & Contacts

Fiches client, segmentation, score de fiabilité (voir section 4.1 du cahier des charges).

## Endpoints

- `GET /api/clients` — liste paginée, recherche (`search`) et filtre par segment (`segment`). Permission `CLIENTS:READ`.
- `GET /api/clients/:id` — détail d'un client avec ses projets liés. Permission `CLIENTS:READ`.
- `POST /api/clients` — création. Permission `CLIENTS:CREATE`.
- `PUT /api/clients/:id` — modification. Permission `CLIENTS:UPDATE`.
- `DELETE /api/clients/:id` — suppression. Permission `CLIENTS:DELETE`.

## Modèle de données

`Client` : nom, segment (Artiste/Label/Agence pub/Entreprise/Institution/Autre), email, téléphone (+261 validé), adresse, notes, score de fiabilité (défaut 100).

## État

Implémenté : CRUD complet, validation temps réel (téléphone malgache, email RFC), recherche/pagination, audit log.

À faire (évolutions futures) : fiche droits/royalties, programme de fidélité automatique, lien artiste ↔ label, historique d'interactions détaillé.
