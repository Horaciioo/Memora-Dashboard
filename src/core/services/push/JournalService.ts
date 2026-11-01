import 'server-only'

import { prisma } from '@/core/lib/db'
import { APPLICATION_SETTINGS } from '@/declarations/configurations/settings'
import type { PushJournalPage } from '@/types/push'
import { NOTIFICATION_KINDS } from '@/utils/constants/notifications'
import { PUSH_DELIVERY_STATUSES } from '@/utils/constants/push'

/**
 * Read one page of the push journal, newest first
 * @param {string} [after] - Last line already held
 * @return {Promise<PushJournalPage>} - Lines and the cursor of the next page
 */

export const readPushJournal = async (after?: string): Promise<PushJournalPage> => {
  const take = APPLICATION_SETTINGS.journalPageSize
  const rows = await prisma.pushDelivery.findMany({
    include: { account: { select: { displayName: true } } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    // One more tells whether another page waits
    take: take + 1,
    ...(after ? { cursor: { id: after }, skip: 1 } : {}),
  })

  const entries = rows.slice(0, take).map((row) => ({
    id: row.id,
    accountName: row.account.displayName,
    kind: NOTIFICATION_KINDS.byId(row.kind)?.name ?? null,
    status: PUSH_DELIVERY_STATUSES.byId(row.status)?.name ?? 'Failed',
    statusCode: row.statusCode,
    device: row.device,
    isTest: row.isTest,
    createdAt: row.createdAt.toISOString(),
  }))

  return { entries, next: rows.length > take ? (entries.at(-1)?.id ?? null) : null }
}
