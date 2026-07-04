/**
 * Modules et actions couvrant la matrice de permissions granulaire (module x action).
 * La matrice elle-même (quel rôle a quelle action sur quel module) est stockée en base
 * et administrable sans redéploiement — ces listes ne servent qu'à typer les valeurs possibles.
 */
export enum PermissionModule {
  CLIENTS = "clients",
  PROJECTS = "projects",
  PLANNING = "planning",
  RESOURCES = "resources",
  BILLING = "billing",
  REPORTING = "reporting",
  SETTINGS = "settings",
  USERS = "users",
}

export enum PermissionAction {
  READ = "read",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  EXPORT = "export",
  VALIDATE = "validate",
}

/** Rôles fournis par défaut ; l'administrateur peut en créer d'autres. */
export enum DefaultRole {
  ADMIN = "admin",
  PRODUCER = "producer",
  SOUND_ENGINEER = "sound_engineer",
  SALES = "sales",
  ACCOUNTING = "accounting",
  CLIENT_PORTAL = "client_portal",
  FREELANCER = "freelancer",
}
