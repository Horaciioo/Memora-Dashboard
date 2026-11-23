import 'server-only'

import { prisma } from '@/core/lib/db'
import { RECAP_SKIPPED } from '@/declarations/recap/tiers'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'
import { NOTIFICATION_TARGETS } from '@/declarations/notifications/targets'
import type { NotificationTargetName } from '@/declarations/notifications/targets'
import type { RecapContext, RecapDraft } from '@/types/recap'
import { NOTIFICATION_KINDS } from '@/utils/constants/notifications'

/**
 * Alerts raised for the member, one beat per kind and record
 * @param {RecapContext} context - Member and window
 * @return {Promise<RecapDraft[]>} - Beats
 */

export const readAlertBeats = async ({
  accountId,
  since,
  until,
}: RecapContext): Promise<RecapDraft[]> => {
  const rows = await prisma.notification.findMany({
    where: { recipientId: accountId, createdAt: { gt: since, lte: until } },
    select: {
      kind: true,
      actorId: true,
      targetType: true,
      targetId: true,
      subject: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: RECAP_SETTINGS.sourceTake,
  })

  const known = rows.flatMap((row) => {
    const kind = NOTIFICATION_KINDS.byId(row.kind)?.name

    return kind && !RECAP_SKIPPED.has(kind) ? [{ ...row, name: kind }] : []
  })
  const groups = Map.groupBy(known, (row) => `${row.name}|${row.targetType}|${row.targetId}`)

  return [...groups.values()].map((group) => {
    // Newest first, so the head speaks for the group
    const [head] = group
    const target = head.targetType ?? ''

    return {
      beat: 'alert',
      alert: head.name,
      at: head.createdAt,
      actorIds: [...new Set(group.flatMap((row) => (row.actorId ? [row.actorId] : [])))],
      count: group.length,
      target: NOTIFICATION_TARGETS.has(target) ? (target as NotificationTargetName) : null,
      targetId: head.targetId,
      subject: head.subject,
    }
  })
}
