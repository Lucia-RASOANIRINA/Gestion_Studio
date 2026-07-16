export type StudioType = "RECORDING" | "PODCAST" | "LIVE" | "VIDEO" | "REHEARSAL" | "OTHER";
export type StudioStatus = "AVAILABLE" | "MAINTENANCE" | "CLOSED";

export const STUDIO_TYPES: StudioType[] = ["RECORDING", "PODCAST", "LIVE", "VIDEO", "REHEARSAL", "OTHER"];
export const STUDIO_STATUSES: StudioStatus[] = ["AVAILABLE", "MAINTENANCE", "CLOSED"];

export interface Studio {
  id: string;
  name: string;
  type: StudioType;
  capacity: number;
  hourlyPrice: string | number | null;
  status: StudioStatus;
  description: string | null;
  equipmentSummary: string | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudioListResponse {
  items: Studio[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StudioFormValue {
  name: string;
  type: StudioType;
  capacity: number;
  hourlyPrice?: number | null;
  status: StudioStatus;
  description?: string | null;
  equipmentSummary?: string | null;
  photoUrl?: string | null;
  notes?: string | null;
}
