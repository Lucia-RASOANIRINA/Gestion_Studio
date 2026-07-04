import { prisma } from "../../config/prisma";

interface RecordAuditLogInput {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: unknown;
  ipAddress?: string;
}

/** Écriture seule : le journal d'audit n'expose aucune route de modification/suppression. */
export async function recordAuditLog(input: RecordAuditLogInput) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metadata: input.metadata as never,
      ipAddress: input.ipAddress,
    },
  });
}
