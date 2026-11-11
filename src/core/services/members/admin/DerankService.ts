import 'server-only'

import { composeDerank } from '@/core/lib/academy/derank'
import type { DerankEntry } from '@/core/lib/academy/derank'
import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { departMember } from '@/core/services/members/admin/DepartureService'
import { loadTarget } from '@/core/services/members/admin/guards'
import type { AdminActor } from '@/core/services/members/admin/guards'
import { DEPARTURE_EMOJIS } from '@/declarations/academy/parkour'
import type { DerankPeriodName } from '@/declarations/academy/derank'
import type { MemberDeparture } from '@/types/members'
import {
  DepartureKinds,
  GONE_MEMBER_STATUSES,
} from '@/utils/constants/hierarchy'

// Several trades read as "Lives et Discord"
const TRADE_JOINER = ' et '

/**
 * Fold several departure announcements into one: the oldest carries the message, the others leave the queue
 * @param {string[]} ids - Notices to join, at least two
 * @param {string} actorId - Who joined them
 * @return {Promise<MemberDeparture>} - Announcement now holding everyone
 */

export const mergeDepartures = async (
  ids: string[],
  actorId: string
): Promise<MemberDeparture> => {
  const notices = await prisma.departureNotice.findMany({
    where: {
      id: { in: ids },
      kind: DepartureKinds.Dismissal,
      publishedAt: null,
      mergedAt: null,
      username: { not: null },
    },
    orderBy: { createdAt: 'asc' },
  })
  if (notices.length < 2 || notices.length !== new Set(ids).size) throw conflict()

  const entries: DerankEntry[] = notices.map((notice) => ({
    username: notice.username ?? '',
    discordId: notice.discordId ?? '',
    trade: notice.functionName,
    emoji: notice.functionName
      .split(TRADE_JOINER)
      .map((trade) => DEPARTURE_EMOJIS[trade] ?? '')
      .join(' ')
      .trim(),
    period: (notice.period as DerankPeriodName | null) ?? null,
  }))
  const [lead, ...folded] = notices
  const now = new Date()
  const body = composeDerank(entries)

  await prisma.$transaction([
    prisma.departureNotice.update({ where: { id: lead.id }, data: { body, mergedAt: now } }),
    prisma.departureNotice.updateMany({
      where: { id: { in: folded.map((notice) => notice.id) } },
      data: { mergedAt: now, publishedAt: now, publishedById: actorId },
    }),
  ])

  return { id: lead.id, kind: lead.kind, body }
}

/**
 * Dismiss several members at once under one announcement
 * @param {string[]} ids - Accounts to dismiss
 * @param {AdminActor} actor - Who is acting
 * @return {Promise<MemberDeparture>} - Announcement to paste
 */

export const derankMembers = async (
  ids: string[],
  actor: AdminActor
): Promise<MemberDeparture> => {
  const unique = [...new Set(ids)]
  if (unique.length === 0) throw conflict()

  // Nothing is dismissed unless everyone can be
  const rows = await Promise.all(unique.map((id) => loadTarget(id, actor)))
  if (rows.some((row) => GONE_MEMBER_STATUSES.includes(row.status))) throw conflict()

  const departures: MemberDeparture[] = []
  for (const id of unique) departures.push(await departMember(id, DepartureKinds.Dismissal, actor))

  return departures.length === 1
    ? departures[0]
    : mergeDepartures(
        departures.map((departure) => departure.id),
        actor.id
      )
}
