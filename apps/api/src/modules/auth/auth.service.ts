import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/AppError";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import type { LoginInput } from "./auth.validation";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueTokens(userId: string, roles: string[]) {
  const accessToken = jwt.sign({ sub: userId, roles }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
  const refreshToken = jwt.sign({ sub: userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

export async function login(input: LoginInput, ipAddress?: string) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { roles: { include: { role: true } } },
  });

  if (!user || !user.isActive) {
    throw AppError.unauthorized("errors.invalid_credentials");
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw AppError.forbidden("errors.account_locked");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const lockedUntil =
      failedLoginAttempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS) : null;

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts, lockedUntil },
    });
    throw AppError.unauthorized("errors.invalid_credentials");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  await recordAuditLog({
    userId: user.id,
    action: "auth.login",
    entity: "User",
    entityId: user.id,
    ipAddress,
  });

  const roles = user.roles.map((userRole) => userRole.role.name);
  return issueTokens(user.id, roles);
}

export async function refresh(refreshToken: string) {
  let payload: { sub: string };
  try {
    payload = jwt.verify(refreshToken, env.jwt.refreshSecret) as { sub: string };
  } catch {
    throw AppError.unauthorized();
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
  });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw AppError.unauthorized();
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { roles: { include: { role: true } } },
  });
  if (!user || !user.isActive) {
    throw AppError.unauthorized();
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const roles = user.roles.map((userRole) => userRole.role.name);
  return issueTokens(user.id, roles);
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
