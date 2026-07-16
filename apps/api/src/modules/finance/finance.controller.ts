import type { Request, Response } from "express";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import * as financeService from "./finance.service";
import type { ListExpensesQuery } from "./finance.validation";

export async function listExpensesHandler(req: Request, res: Response) {
  const result = await financeService.listExpenses(req.validatedQuery as ListExpensesQuery);
  res.json(result);
}

export async function getTreasuryHandler(_req: Request, res: Response) {
  res.json(await financeService.getTreasury());
}

export async function createExpenseHandler(req: Request, res: Response) {
  const expense = await financeService.createExpense(req.body, req.user?.sub);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "finance.expense.create",
    entity: "Expense",
    entityId: expense.id,
    ipAddress: req.ip,
  });
  res.status(201).json(expense);
}

export async function updateExpenseHandler(req: Request, res: Response) {
  const expense = await financeService.updateExpense(req.params.id, req.body);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "finance.expense.update",
    entity: "Expense",
    entityId: expense.id,
    ipAddress: req.ip,
  });
  res.json(expense);
}

export async function deleteExpenseHandler(req: Request, res: Response) {
  await financeService.deleteExpense(req.params.id);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "finance.expense.delete",
    entity: "Expense",
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.status(204).send();
}
