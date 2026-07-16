import type { StudioRoom } from "../planning/planning.model";

export type EquipmentCategory =
  | "MICROPHONE"
  | "CONSOLE"
  | "INTERFACE"
  | "MONITOR"
  | "INSTRUMENT"
  | "CABLE"
  | "OTHER";

export type EquipmentStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "RETIRED";

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  "MICROPHONE",
  "CONSOLE",
  "INTERFACE",
  "MONITOR",
  "INSTRUMENT",
  "CABLE",
  "OTHER",
];

export const EQUIPMENT_STATUSES: EquipmentStatus[] = ["AVAILABLE", "IN_USE", "MAINTENANCE", "RETIRED"];

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  performedAt: string;
  description: string;
  cost: string | null;
  technician: string | null;
  partsReplaced: string | null;
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  serialNumber: string | null;
  brand: string | null;
  model: string | null;
  location: string | null;
  status: EquipmentStatus;
  studio: StudioRoom | null;
  purchaseDate: string | null;
  warrantyUntil: string | null;
  purchasePrice: string | null;
  currentValue: string | null;
  photoUrl: string | null;
  nextMaintenanceAt: string | null;
  notes: string | null;
  maintenanceRecords?: MaintenanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentFormValue {
  name: string;
  category: EquipmentCategory;
  serialNumber?: string;
  brand?: string;
  model?: string;
  location?: string;
  status: EquipmentStatus;
  studio?: StudioRoom;
  purchaseDate?: string;
  warrantyUntil?: string;
  purchasePrice?: number;
  currentValue?: number;
  photoUrl?: string;
  nextMaintenanceAt?: string;
  notes?: string;
}

export interface MaintenanceFormValue {
  description: string;
  performedAt?: string;
  cost?: number | null;
  technician?: string;
  partsReplaced?: string;
}

export interface EquipmentListResponse {
  items: Equipment[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Consumable {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConsumableFormValue {
  name: string;
  unit: string;
  quantity: number;
  lowStockThreshold: number;
  notes?: string;
}

export interface ConsumableListResponse {
  items: Consumable[];
  total: number;
  page: number;
  pageSize: number;
}
