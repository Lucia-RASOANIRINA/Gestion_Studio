import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/AppError";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import { generateSecret, otpauthUri, verifyToken } from "./totp";
import type { LoginInput } from "./auth.validation";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueTokens(userId: string, roles: string[]) {
  const accessToken = jwt.sign({ sub: userId, roles }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as SignOptions["expiresIn"],
  });
  // jti aléatoire : garantit un token (et donc un tokenHash) unique même pour
  // deux connexions du même utilisateur dans la même seconde.
  const refreshToken = jwt.sign({ sub: userId, jti: crypto.randomUUID() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as SignOptions["expiresIn"],
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

  // Double authentification : si activée, un code TOTP valide est requis.
  if (user.twoFactorEnabled && user.twoFactorSecret) {
    if (!input.code) {
      return { twoFactorRequired: true as const };
    }
    if (!verifyToken(user.twoFactorSecret, input.code)) {
      throw AppError.unauthorized("errors.invalid_2fa_code");
    }
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

/** Génère un secret 2FA (non encore activé) et renvoie l'URI otpauth à configurer. */
export async function setupTwoFactor(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound();

  const secret = generateSecret();
  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });
  return { secret, otpauthUri: otpauthUri(secret, user.email) };
}

/** Active la 2FA après vérification d'un premier code émis par l'app d'authentification. */
export async function enableTwoFactor(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) {
    throw AppError.badRequest("errors.validation_failed");
  }
  if (!verifyToken(user.twoFactorSecret, code)) {
    throw AppError.unauthorized("errors.invalid_2fa_code");
  }
  await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
  await recordAuditLog({ userId, action: "auth.2fa.enable", entity: "User", entityId: userId });
}

/** Désactive la 2FA (nécessite un code valide). */
export async function disableTwoFactor(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) {
    throw AppError.badRequest("errors.validation_failed");
  }
  if (!verifyToken(user.twoFactorSecret, code)) {
    throw AppError.unauthorized("errors.invalid_2fa_code");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });
  await recordAuditLog({ userId, action: "auth.2fa.disable", entity: "User", entityId: userId });
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
