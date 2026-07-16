import { LeaveStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../common/errors/AppError";
import type {
  CreateEmployeeInput,
  CreateLeaveInput,
  ListEmployeesQuery,
  UpdateEmployeeInput,
} from "./hr.validation";

export async function listEmployees(query: ListEmployeesQuery) {
  const where: Prisma.EmployeeWhereInput = {
    ...(query.type ? { type: query.type } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { firstName: { contains: query.search, mode: "insensitive" } },
            { lastName: { contains: query.search, mode: "insensitive" } },
            { position: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      orderBy: { lastName: "asc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { _count: { select: { leaveRequests: true } } },
    }),
    prisma.employee.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getEmployeeById(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: { leaveRequests: { orderBy: { startDate: "desc" } } },
  });
}

export async function createEmployee(input: CreateEmployeeInput, createdById?: string) {
  return prisma.employee.create({ data: { ...input, createdById } });
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound();
  return prisma.employee.update({ where: { id }, data: input });
}

export async function deleteEmployee(id: string) {
  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound();
  await prisma.employee.delete({ where: { id } });
}

export async function addLeave(employeeId: string, input: CreateLeaveInput) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw AppError.notFound();
  if (input.endDate < input.startDate) {
    throw AppError.badRequest("errors.validation_failed");
  }
  return prisma.leaveRequest.create({
    data: {
      employeeId,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
      reason: input.reason ?? null,
    },
  });
}

export async function setLeaveStatus(leaveId: string, status: LeaveStatus) {
  const existing = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
  if (!existing) throw AppError.notFound();
  return prisma.leaveRequest.update({ where: { id: leaveId }, data: { status } });
}

export async function deleteLeave(leaveId: string) {
  const existing = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
  if (!existing) throw AppError.notFound();
  await prisma.leaveRequest.delete({ where: { id: leaveId } });
}
