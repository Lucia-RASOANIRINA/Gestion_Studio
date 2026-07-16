# Module Ressources

Inventaire du matériel et gestion des stocks consommables (voir section 4.4 du cahier des charges).

## Endpoints — Matériel (`/api/resources/equipment`)

- `GET /api/resources/equipment` — liste paginée, recherche, filtre par catégorie/statut/studio. Permission `RESOURCES:READ`.
- `GET /api/resources/equipment/:id` — détail. Permission `RESOURCES:READ`.
- `POST /api/resources/equipment` — création. Permission `RESOURCES:CREATE`.
- `PUT /api/resources/equipment/:id` — modification. Permission `RESOURCES:UPDATE`.
- `DELETE /api/resources/equipment/:id` — suppression. Permission `RESOURCES:DELETE`.

Modèle `Equipment` : nom, catégorie (micro/console/interface/moniteur/instrument/câble/autre), numéro de série, état (disponible/en session/en maintenance/retiré), studio de rattachement, date d'achat, prix d'achat, valeur résiduelle (amortissement suivi manuellement), notes.

## Endpoints — Consommables (`/api/resources/consumables`)

- `GET /api/resources/consumables?lowStockOnly=true` — liste avec indicateur `isLowStock` calculé (`quantity <= lowStockThreshold`). Permission `RESOURCES:READ`.
- `GET /api/resources/consumables/:id` — détail. Permission `RESOURCES:READ`.
- `POST /api/resources/consumables` — création. Permission `RESOURCES:CREATE`.
- `PUT /api/resources/consumables/:id` — modification. Permission `RESOURCES:UPDATE`.
- `POST /api/resources/consumables/:id/adjust` — ajustement rapide du stock (`{ "delta": ±n }`), rejette un ajustement qui ferait passer la quantité sous zéro. Permission `RESOURCES:UPDATE`.
- `DELETE /api/resources/consumables/:id` — suppression. Permission `RESOURCES:DELETE`.

## Logique métier ([resources-stock.ts](./resources-stock.ts), testée unitairement)

- **Alerte de stock bas** : dérivée, jamais stockée en base.
- **Ajustement de stock** : refuse toute opération qui ferait descendre la quantité sous zéro.

## État

Implémenté : CRUD complet matériel + consommables, alerte de stock bas, ajustement rapide.

À faire (évolutions futures) : étiquetage QR code/code-barres pour check-in/check-out physique, historique de maintenance/prêts détaillé, coût d'usage par équipement (cumul du temps d'utilisation, panne fréquente).
