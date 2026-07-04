import { ClientSegment } from "@gestion-studio/shared";

export { ClientSegment };

export interface Client {
  id: string;
  name: string;
  segment: ClientSegment;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  reliabilityScore: number;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number };
}

export interface ClientListResponse {
  items: Client[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ClientFormValue {
  name: string;
  segment: ClientSegment;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export const CLIENT_SEGMENTS: ClientSegment[] = [
  ClientSegment.ARTIST,
  ClientSegment.LABEL,
  ClientSegment.ADVERTISING_AGENCY,
  ClientSegment.COMPANY,
  ClientSegment.INSTITUTION,
  ClientSegment.OTHER,
];
