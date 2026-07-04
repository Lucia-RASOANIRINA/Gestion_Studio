import type { Request, Response } from "express";
import { PermissionModule } from "@prisma/client";
import { AppError } from "../../common/errors/AppError";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import { requiredPermissionForTransition } from "./project-workflow";
import * as projectsService from "./projects.service";
import type { ListProjectsQuery } from "./projects.validation";
import { hasPermission } from "../../common/rbac/hasPermission";

export async function listProjectsHandler(req: Request, res: Response) {
  const result = await projectsService.listProjects(req.validatedQuery as ListProjectsQuery);
  res.json(result);
}

export async function getProjectHandler(req: Request, res: Response) {
  const project = await projectsService.getProjectById(req.params.id);
  if (!project) {
    throw AppError.notFound();
  }
  res.json(project);
}

export async function createProjectHandler(req: Request, res: Response) {
  const project = await projectsService.createProject(req.body, req.user?.sub);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "projects.create",
    entity: "Project",
    entityId: project.id,
    ipAddress: req.ip,
  });
  res.status(201).json(project);
}

export async function updateProjectHandler(req: Request, res: Response) {
  const existing = await projectsService.getProjectById(req.params.id);
  if (!existing) {
    throw AppError.notFound();
  }
  const project = await projectsService.updateProject(req.params.id, req.body);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "projects.update",
    entity: "Project",
    entityId: project.id,
    ipAddress: req.ip,
  });
  res.json(project);
}

export async function transitionProjectHandler(req: Request, res: Response) {
  const requiredAction = requiredPermissionForTransition(req.body.status);
  const allowed = await hasPermission(req.user?.sub, PermissionModule.PROJECTS, requiredAction);
  if (!allowed) {
    throw AppError.forbidden();
  }

  const project = await projectsService.transitionProject(req.params.id, req.body.status);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "projects.transition",
    entity: "Project",
    entityId: project.id,
    metadata: { to: req.body.status },
    ipAddress: req.ip,
  });
  res.json(project);
}

export async function deleteProjectHandler(req: Request, res: Response) {
  const existing = await projectsService.getProjectById(req.params.id);
  if (!existing) {
    throw AppError.notFound();
  }
  await projectsService.deleteProject(req.params.id);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "projects.delete",
    entity: "Project",
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.status(204).send();
}
