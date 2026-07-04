import { Currency, ServiceType } from "@gestion-studio/shared";

export { Currency, ServiceType };

export type ProjectStatus =
  | "QUOTE"
  | "VALIDATED"
  | "IN_PROGRESS"
  | "REVIEW"
  | "DELIVERED"
  | "INVOICED"
  | "ARCHIVED";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "QUOTE",
  "VALIDATED",
  "IN_PROGRESS",
  "REVIEW",
  "DELIVERED",
  "INVOICED",
  "ARCHIVED",
];

export const PROJECT_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  QUOTE: ["VALIDATED"],
  VALIDATED: ["IN_PROGRESS"],
  IN_PROGRESS: ["REVIEW"],
  REVIEW: ["IN_PROGRESS", "DELIVERED"],
  DELIVERED: ["INVOICED"],
  INVOICED: ["ARCHIVED"],
  ARCHIVED: [],
};

export interface ProjectClientRef {
  id: string;
  name: string;
  segment: string;
}

export interface Project {
  id: string;
  reference: string;
  title: string;
  serviceType: ServiceType;
  status: ProjectStatus;
  description: string | null;
  budgetAmount: string | null;
  budgetCurrency: Currency;
  startDate: string | null;
  dueDate: string | null;
  client: ProjectClientRef;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProjectFormValue {
  title: string;
  clientId: string;
  serviceType: ServiceType;
  description?: string;
  budgetAmount?: number;
  budgetCurrency?: Currency;
  startDate?: string;
  dueDate?: string;
}

export const SERVICE_TYPES: ServiceType[] = [
  ServiceType.RECORDING,
  ServiceType.MIXING,
  ServiceType.MASTERING,
  ServiceType.POST_PRODUCTION,
  ServiceType.VOICE_OVER,
  ServiceType.EQUIPMENT_RENTAL,
  ServiceType.LIVE_EVENT,
  ServiceType.OTHER,
];
