import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import * as billingService from "./billing.service";
import type { ListInvoicesQuery } from "./billing.validation";

export async function listInvoicesHandler(req: Request, res: Response) {
  const result = await billingService.listInvoices(req.validatedQuery as ListInvoicesQuery);
  res.json(result);
}

export async function getSummaryHandler(_req: Request, res: Response) {
  const summary = await billingService.getBillingSummary();
  res.json(summary);
}

export async function getInvoiceHandler(req: Request, res: Response) {
  const invoice = await billingService.getInvoiceById(req.params.id);
  if (!invoice) throw AppError.notFound();
  res.json(invoice);
}

export async function createInvoiceHandler(req: Request, res: Response) {
  const invoice = await billingService.createInvoice(req.body, req.user?.sub);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "billing.invoice.create",
    entity: "Invoice",
    entityId: invoice.id,
    ipAddress: req.ip,
  });
  res.status(201).json(invoice);
}

export async function updateInvoiceHandler(req: Request, res: Response) {
  const invoice = await billingService.updateInvoice(req.params.id, req.body);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "billing.invoice.update",
    entity: "Invoice",
    entityId: invoice.id,
    ipAddress: req.ip,
  });
  res.json(invoice);
}

export async function updateInvoiceStatusHandler(req: Request, res: Response) {
  const invoice = await billingService.updateInvoiceStatus(req.params.id, req.body.status);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "billing.invoice.status",
    entity: "Invoice",
    entityId: invoice.id,
    metadata: { status: req.body.status },
    ipAddress: req.ip,
  });
  res.json(invoice);
}

export async function addPaymentHandler(req: Request, res: Response) {
  const invoice = await billingService.addPayment(req.params.id, req.body, req.user?.sub);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "billing.payment.create",
    entity: "Invoice",
    entityId: req.params.id,
    metadata: { amount: req.body.amount, method: req.body.method },
    ipAddress: req.ip,
  });
  res.status(201).json(invoice);
}

export async function signInvoiceHandler(req: Request, res: Response) {
  const invoice = await billingService.signInvoice(
    req.params.id,
    req.body.signatureDataUrl,
    req.body.signedBy
  );
  await recordAuditLog({
    userId: req.user?.sub,
    action: "billing.invoice.sign",
    entity: "Invoice",
    entityId: invoice.id,
    metadata: { signedBy: req.body.signedBy },
    ipAddress: req.ip,
  });
  res.json(invoice);
}

export async function deleteInvoiceHandler(req: Request, res: Response) {
  await billingService.deleteInvoice(req.params.id);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "billing.invoice.delete",
    entity: "Invoice",
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.status(204).send();
}
