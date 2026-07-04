import type { PermissionAction, PermissionModule } from "@prisma/client";
import { prisma } from "../../config/prisma";

export async function hasPermission(
  userId: string | undefined,
  module: PermissionModule,
  action: PermissionAction
): Promise<boolean> {
  if (!userId) return false;

  const count = await prisma.rolePermission.count({
    where: {
      role: { users: { some: { userId } } },
      permission: { module, action },
    },
  });

  return count > 0;
}
