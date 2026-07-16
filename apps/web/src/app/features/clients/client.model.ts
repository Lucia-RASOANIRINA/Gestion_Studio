import { ClientSegment } from "@gestion-studio/shared";

export { ClientSegment };

export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface Client {
  id: string;
  name: string;
  segment: ClientSegment;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  reliabilityScore: number;
  loyaltyPoints: number;
  tier: LoyaltyTier;
  isBlacklisted: boolean;
  blacklistReason: string | null;
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
