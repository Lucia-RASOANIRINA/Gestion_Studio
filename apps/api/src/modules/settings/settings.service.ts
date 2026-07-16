import { prisma } from "../../config/prisma";
import { AppError } from "../../common/errors/AppError";
import type { UpdateProfileInput } from "./settings.validation";

const profileSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  locale: true,
  theme: true,
  twoFactorEnabled: true,
  createdAt: true,
  roles: { select: { role: { select: { name: true, description: true } } } },
} as const;

function shapeProfile(user: {
  roles: { role: { name: string; description: string | null } }[];
} & Record<string, unknown>) {
  const { roles, ...rest } = user;
  return { ...rest, roles: roles.map((r) => r.role) };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: profileSelect });
  if (!user) throw AppError.notFound();
  return shapeProfile(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      locale: input.locale,
      theme: input.theme,
    },
    select: profileSelect,
  });
  return shapeProfile(user);
}
