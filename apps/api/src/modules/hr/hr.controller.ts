import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import * as hrService from "./hr.service";
import type { ListEmployeesQuery } from "./hr.validation";

export async function listEmployeesHandler(req: Request, res: Response) {
  const result = await hrService.listEmployees(req.validatedQuery as ListEmployeesQuery);
  res.json(result);
}

export async function getEmployeeHandler(req: Request, res: Response) {
  const employee = await hrService.getEmployeeById(req.params.id);
  if (!employee) throw AppError.notFound();
  res.json(employee);
}

export async function createEmployeeHandler(req: Request, res: Response) {
  const employee = await hrService.createEmployee(req.body, req.user?.sub);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "hr.employee.create",
    entity: "Employee",
    entityId: employee.id,
    ipAddress: req.ip,
  });
  res.status(201).json(employee);
}

export async function updateEmployeeHandler(req: Request, res: Response) {
  const employee = await hrService.updateEmployee(req.params.id, req.body);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "hr.employee.update",
    entity: "Employee",
    entityId: employee.id,
    ipAddress: req.ip,
  });
  res.json(employee);
}

export async function deleteEmployeeHandler(req: Request, res: Response) {
  await hrService.deleteEmployee(req.params.id);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "hr.employee.delete",
    entity: "Employee",
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.status(204).send();
}

export async function addLeaveHandler(req: Request, res: Response) {
  const leave = await hrService.addLeave(req.params.id, req.body);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "hr.leave.create",
    entity: "Employee",
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.status(201).json(leave);
}

export async function updateLeaveStatusHandler(req: Request, res: Response) {
  const leave = await hrService.setLeaveStatus(req.params.leaveId, req.body.status);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "hr.leave.status",
    entity: "LeaveRequest",
    entityId: req.params.leaveId,
    metadata: { status: req.body.status },
    ipAddress: req.ip,
  });
  res.json(leave);
}

export async function deleteLeaveHandler(req: Request, res: Response) {
  await hrService.deleteLeave(req.params.leaveId);
  res.status(204).send();
}
