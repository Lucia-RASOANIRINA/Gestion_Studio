import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import * as clientsService from "./clients.service";
import type { ListClientsQuery } from "./clients.validation";

export async function listClientsHandler(req: Request, res: Response) {
  const result = await clientsService.listClients(req.validatedQuery as ListClientsQuery);
  res.json(result);
}

export async function getClientHandler(req: Request, res: Response) {
  const client = await clientsService.getClientById(req.params.id);
  if (!client) {
    throw AppError.notFound();
  }
  res.json(client);
}

export async function createClientHandler(req: Request, res: Response) {
  const client = await clientsService.createClient(req.body, req.user?.sub);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "clients.create",
    entity: "Client",
    entityId: client.id,
    ipAddress: req.ip,
  });
  res.status(201).json(client);
}

export async function updateClientHandler(req: Request, res: Response) {
  const existing = await clientsService.getClientById(req.params.id);
  if (!existing) {
    throw AppError.notFound();
  }
  const client = await clientsService.updateClient(req.params.id, req.body);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "clients.update",
    entity: "Client",
    entityId: client.id,
    ipAddress: req.ip,
  });
  res.json(client);
}

export async function blacklistClientHandler(req: Request, res: Response) {
  const existing = await clientsService.getClientById(req.params.id);
  if (!existing) {
    throw AppError.notFound();
  }
  const client = await clientsService.setBlacklist(
    req.params.id,
    req.body.isBlacklisted,
    req.body.reason
  );
  await recordAuditLog({
    userId: req.user?.sub,
    action: req.body.isBlacklisted ? "clients.blacklist.on" : "clients.blacklist.off",
    entity: "Client",
    entityId: client.id,
    metadata: { reason: req.body.reason },
    ipAddress: req.ip,
  });
  res.json(client);
}

export async function deleteClientHandler(req: Request, res: Response) {
  const existing = await clientsService.getClientById(req.params.id);
  if (!existing) {
    throw AppError.notFound();
  }
  await clientsService.deleteClient(req.params.id);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "clients.delete",
    entity: "Client",
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.status(204).send();
}
