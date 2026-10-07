import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, invalidInput, notFound } from '@/core/lib/errors'
import { coordinationGaps } from '@/core/lib/lives/coordination'
import { isOpenLive } from '@/core/lib/lives/permissions'
import { readAnchors } from '@/core/services/auth/LeadService'
import { notify } from '@/core/services/system/NotificationService'
import { LIVE_COORDINATION_COPY } from '@/declarations/lives/copy'
import { LIVE_CLOCK_ZONE } from '@/declarations/lives/registries'
import type { CoordinationRequest } from '@/types/lives'
import { CoordinationStatuses, OPEN_LIVE_STATUSES } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'

/**
 * Answer of a member asked to coordinate
 * @typedef {Object} CoordinationAnswer
 * @property {boolean} accept - Agrees to coordinate
 * @property {Date | null} startsAt - Agreed window start
 * @property {Date | null} endsAt - Agreed window end
 */

export interface CoordinationAnswer {
  accept: boolean
  startsAt: Date | null
  endsAt: Date | null
}

// Notification text is fixed server-side, so it reads in the team's zone
const clock = (date: Date): string =>
  date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: LIVE_CLOCK_ZONE,
  })

/**
 * Wording of the stretches left uncovered
 * @param {{ from: Date, to: Date }[]} gaps - Uncovered stretches
 * @return {string} - "de 20:00 à 21:00, de ..."
 */

const gapLabel = (gaps: { from: Date; to: Date }[]): string =>
  gaps
    .map((gap) =>
      LIVE_COORDINATION_COPY.gapRange
        .replace('{from}', clock(gap.from))
        .replace('{to}', clock(gap.to))
    )
    .join(', ')

/**
 * Requests waiting on a member's answer
 * @param {string} accountId - Member
 * @return {Promise<CoordinationRequest[]>} - Open lives that ask them
 */

export const myCoordinationRequests = async (accountId: string): Promise<CoordinationRequest[]> => {
  const rows = await prisma.liveCoordination.findMany({
    where: {
      accountId,
      status: CoordinationStatuses.Asked,
      live: { status: { in: [...OPEN_LIVE_STATUSES] } },
    },
    include: {
      live: {
        select: {
          id: true,
          title: true,
          plannedStartAt: true,
          plannedEndAt: true,
          youtuber: { select: { name: true } },
          announcedBy: { select: { displayName: true } },
        },
      },
    },
    orderBy: { live: { plannedStartAt: 'asc' } },
  })

  return rows.map(({ live }) => ({
    liveId: live.id,
    title: live.title,
    creator: live.youtuber.name,
    startsAt: live.plannedStartAt.toISOString(),
    endsAt: (live.plannedEndAt ?? live.plannedStartAt).toISOString(),
    askedBy: live.announcedBy?.displayName ?? null,
  }))
}

/**
 * Record a member's answer, then tell who must know about any hole left in the live
 * @param {string} liveId - Live
 * @param {string} accountId - Member answering
 * @param {CoordinationAnswer} answer - Their answer
 * @return {Promise<{ gaps: { from: string, to: string }[] }>} - Stretches still uncovered
 */

export const answerCoordination = async (
  liveId: string,
  accountId: string,
  answer: CoordinationAnswer
): Promise<{ gaps: { from: string; to: string }[] }> => {
  const live = await prisma.live.findUnique({
    where: { id: liveId },
    include: { coordinations: true },
  })
  const seat = live?.coordinations.find((entry) => entry.accountId === accountId)
  if (!live || !seat) throw notFound()
  if (!isOpenLive(live.status as LiveStatusName)) throw conflict()

  const end = live.plannedEndAt
  const { startsAt, endsAt } = answer

  if (answer.accept) {
    const invalid =
      !startsAt ||
      !endsAt ||
      startsAt >= endsAt ||
      startsAt < live.plannedStartAt ||
      (end !== null && endsAt > end)
    if (invalid) {
      throw invalidInput([{ field: 'startsAt', message: LIVE_COORDINATION_COPY.badWindow }])
    }
  }

  await prisma.liveCoordination.update({
    where: { id: seat.id },
    data: answer.accept
      ? { status: CoordinationStatuses.Accepted, startsAt, endsAt, respondedAt: new Date() }
      : {
          status: CoordinationStatuses.Declined,
          startsAt: null,
          endsAt: null,
          respondedAt: new Date(),
        },
  })

  const seats = await prisma.liveCoordination.findMany({ where: { liveId } })
  const gaps = coordinationGaps(live.plannedStartAt, end, seats)

  // Responsables learn the answer, coordinators learn what is still missing
  const anchors = await readAnchors(live.youtuberId)
  const audience = [live.announcedById, ...anchors.map((anchor) => anchor.accountId)]
  await notify({
    kind: answer.accept ? 'LiveCoordinatorAccepted' : 'LiveCoordinatorDeclined',
    recipients: audience,
    actorId: accountId,
    target: 'live',
    targetId: live.id,
    subject: live.title,
  })

  if (gaps.length > 0) {
    const accepted = seats
      .filter((entry) => entry.status === CoordinationStatuses.Accepted)
      .map((entry) => entry.accountId)
    await notify({
      kind: 'LiveCoordinatorGap',
      recipients: [...audience, ...accepted],
      target: 'live',
      targetId: live.id,
      subject: `${live.title}, ${gapLabel(gaps)}`,
    })
  }

  return { gaps: gaps.map((gap) => ({ from: gap.from.toISOString(), to: gap.to.toISOString() })) }
}
