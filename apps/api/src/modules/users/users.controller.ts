import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import * as usersService from "./users.service";

export async function listUsersHandler(_req: Request, res: Response) {
  const users = await usersService.listUsers();
  res.json(users);
}

export async function getUserHandler(req: Request, res: Response) {
  const user = await usersService.getUserById(req.params.id);
  if (!user) {
    throw AppError.notFound();
  }
  res.json(user);
}
