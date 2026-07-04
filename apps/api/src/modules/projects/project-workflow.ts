import { PermissionAction, ProjectStatus } from "@prisma/client";
import { AppError } from "../../common/errors/AppError";

/**
 * Workflow imposé : Devis → Validé → En cours → Révision → Livré → Facturé → Archivé.
 * Un aller-retour Révision ↔ En cours est autorisé pour les demandes de retouche.
 */
const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.QUOTE]: [ProjectStatus.VALIDATED],
  [ProjectStatus.VALIDATED]: [ProjectStatus.IN_PROGRESS],
  [ProjectStatus.IN_PROGRESS]: [ProjectStatus.REVIEW],
  [ProjectStatus.REVIEW]: [ProjectStatus.IN_PROGRESS, ProjectStatus.DELIVERED],
  [ProjectStatus.DELIVERED]: [ProjectStatus.INVOICED],
  [ProjectStatus.INVOICED]: [ProjectStatus.ARCHIVED],
  [ProjectStatus.ARCHIVED]: [],
};

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Seul un producteur (permission PROJECTS:VALIDATE) peut faire passer un projet à "Validé". */
export function requiredPermissionForTransition(to: ProjectStatus): PermissionAction {
  return to === ProjectStatus.VALIDATED ? PermissionAction.VALIDATE : PermissionAction.UPDATE;
}

export function assertTransition(from: ProjectStatus, to: ProjectStatus): void {
  if (!canTransition(from, to)) {
    throw AppError.badRequest("errors.invalid_project_transition");
  }
}
