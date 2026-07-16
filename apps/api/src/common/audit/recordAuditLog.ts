import { prisma } from "../../config/prisma";

interface RecordAuditLogInput {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: unknown;
  ipAddress?: string;
}

/**
 * Écriture seule : le journal d'audit n'expose aucune route de modification/suppression.
 * Chaque événement audité génère aussi une notification persistante (fil d'activité),
 * avec l'acteur dénormalisé pour rester lisible même après suppression du compte.
 */
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

  let actorName: string | null = null;
  if (input.userId) {
    const actor = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { firstName: true, lastName: true },
    });
    if (actor) actorName = `${actor.firstName} ${actor.lastName}`.trim();
  }

  await prisma.notification.create({
    data: {
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      actorId: input.userId,
      actorName,
    },
  });
}
