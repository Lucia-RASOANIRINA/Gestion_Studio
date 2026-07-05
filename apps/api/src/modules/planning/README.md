# Module Planning & Réservations

Calendrier des réservations de studio, détection automatique de conflits, gestion des indisponibilités (voir section 4.3 du cahier des charges).

## Endpoints

- `GET /api/planning?from=&to=&studio=&engineerId=` — liste les réservations chevauchant la plage `[from, to]`, filtrable par studio/ingénieur. Permission `PLANNING:READ`.
- `GET /api/planning/:id` — détail. Permission `PLANNING:READ`.
- `GET /api/planning/:id/ics` — export de la réservation au format iCal (`.ics`), pour import dans un agenda personnel. Permission `PLANNING:READ`.
- `POST /api/planning` — création (validation + détection de conflit). Permission `PLANNING:CREATE`.
- `PUT /api/planning/:id` — modification (re-détection de conflit, en excluant la réservation elle-même). Permission `PLANNING:UPDATE`.
- `DELETE /api/planning/:id` — suppression. Permission `PLANNING:DELETE`.

## Modèle de données

`Booking` : studio (A/B/C/Mobile), type (session ou indisponibilité), titre, plage horaire, projet lié (optionnel), ingénieur assigné (optionnel), notes.

## Logique métier ([planning-conflict.ts](./planning-conflict.ts), testée unitairement)

- **Détection de conflit** : deux réservations sont en conflit si leurs plages horaires se chevauchent ET qu'elles partagent le même studio OU le même ingénieur.
- **Durée de session** : doit être un multiple de 15 minutes.
- **Date de réservation** : jamais dans le passé.

## État

Implémenté : CRUD complet, détection de conflits en temps réel (409 avec la liste des réservations en conflit), export iCal.

À faire (évolutions futures) : rappels automatiques (SMS/push), synchronisation Google Calendar, liste d'attente automatique, vue d'occupation agrégée multi-studio.
