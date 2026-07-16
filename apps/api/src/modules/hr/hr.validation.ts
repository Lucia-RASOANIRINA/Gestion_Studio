import { z } from "zod";
import { EmployeeStatus, EmployeeType, LeaveStatus, LeaveType } from "@prisma/client";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const listEmployeesQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  type: z.nativeEnum(EmployeeType).optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  position: z.string().trim().min(2).max(120),
  type: z.nativeEnum(EmployeeType).default(EmployeeType.EMPLOYEE),
  email: z.string().email().max(200).optional().or(z.literal("").transform(() => undefined)),
  phone: optionalText(40),
  hireDate: z.coerce.date().optional(),
  dailyRate: z.coerce.number().min(0).max(1_000_000_000).optional().nullable(),
  status: z.nativeEnum(EmployeeStatus).default(EmployeeStatus.ACTIVE),
  notes: optionalText(2000),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const createLeaveSchema = z.object({
  type: z.nativeEnum(LeaveType).default(LeaveType.LEAVE),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.nativeEnum(LeaveStatus).default(LeaveStatus.PENDING),
  reason: optionalText(500),
});

export const updateLeaveStatusSchema = z.object({
  status: z.nativeEnum(LeaveStatus),
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
