export type EmployeeType = "EMPLOYEE" | "FREELANCE";
export type EmployeeStatus = "ACTIVE" | "INACTIVE";
export type LeaveType = "LEAVE" | "SICK" | "UNPAID" | "OVERTIME" | "ABSENCE";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export const EMPLOYEE_TYPES: EmployeeType[] = ["EMPLOYEE", "FREELANCE"];
export const EMPLOYEE_STATUSES: EmployeeStatus[] = ["ACTIVE", "INACTIVE"];
export const LEAVE_TYPES: LeaveType[] = ["LEAVE", "SICK", "UNPAID", "OVERTIME", "ABSENCE"];
export const LEAVE_STATUSES: LeaveStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  reason: string | null;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  type: EmployeeType;
  email: string | null;
  phone: string | null;
  hireDate: string | null;
  dailyRate: string | number | null;
  status: EmployeeStatus;
  notes: string | null;
  leaveRequests?: LeaveRequest[];
  _count?: { leaveRequests: number };
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeListResponse {
  items: Employee[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EmployeeFormValue {
  firstName: string;
  lastName: string;
  position: string;
  type: EmployeeType;
  email?: string;
  phone?: string;
  hireDate?: string;
  dailyRate?: number | null;
  status: EmployeeStatus;
  notes?: string;
}

export interface LeaveFormValue {
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  reason?: string;
}
