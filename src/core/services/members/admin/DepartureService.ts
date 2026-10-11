import 'server-only'

import { fillDeparture } from '@/core/lib/academy/parkour'
import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { endParkour } from '@/core/services/academy/ParkourService'
import { loadTarget } from '@/core/services/members/admin/guards'
import type { AdminActor, TargetRow } from '@/core/services/members/admin/guards'
import { clearVolunteeredDetails } from '@/core/services/members/MemberService'
import { notify } from '@/core/services/system/NotificationService'
import {
  DEPARTURE_EMOJIS,
  DEPARTURE_TEMPLATES,
  DEPARTURE_VERBS,
} from '@/declarations/academy/parkour'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { tradeOfFunction } from '@/declarations/reference/fixed'
import type { MemberDeparture } from '@/types/members'
import {
  AcademyJuniorStatuses,
  DepartureKinds,
  GONE_MEMBER_STATUSES,
  LegacyStatuses,
  MemberRoles,
  MemberStatuses,
} from '@/utils/constants/hierarchy'
import type { DepartureKindName } from '@/utils/constants/hierarchy'
import { LiveStatuses } from '@/utils/constants/lives'
import { FunctionKinds } from '@/utils/constants/workflow'
import type { DepartureNotice } from '@prisma/client'

/**
 * Notice as the file reads it
 * @param {DepartureNotice} notice - Stored notice
 * @return {MemberDeparture} - Announcement
 */

const toDeparture = (notice: DepartureNotice): MemberDeparture => ({
  id: notice.id,
  kind: notice.kind,
  body: notice.body,
})

/**
 * Trades a member holds as a main function
 * @param {TargetRow} row - Target
 * @return {string[]} - Trade names, each once
 */

const tradesOf = (row: TargetRow): string[] => [
  ...new Set(
    row.functions
      .filter((held) => held.jobFunction.kind === FunctionKinds.Primary)
      .map((held) => tradeOfFunction(held.jobFunction.name))
  ),
]

/**
 * Last announcement written for a member
 * @param {string} accountId - Account identifier
 * @return {Promise<MemberDeparture | null>} - Announcement
 */

export const readDeparture = async (accountId: string): Promise<MemberDeparture | null> => {
  const notice = await prisma.departureNotice.findFirst({
    where: { accountId },
    orderBy: { createdAt: 'desc' },
  })

  return notice ? toDeparture(notice) : null
}

/**
 * Let a member go: access cut, personal data erased, announcement drafted
 * @param {string} id - Account identifier
 * @param {DepartureKindName} kind - Dismissal or resignation
 * @param {AdminActor} actor - Who is acting
 * @return {Promise<MemberDeparture>} - Announcement to paste
 */

export const departMember = async (
  id: string,
  kind: DepartureKindName,
  actor: AdminActor
): Promise<MemberDeparture> => {
  const row = await loadTarget(id, actor)
  if (GONE_MEMBER_STATUSES.includes(row.status)) throw conflict()

  // A PIM in course closes through its own path
  const junior = await prisma.academyJunior.findFirst({
    where: { accountId: id, status: AcademyJuniorStatuses.Active },
    select: { id: true },
  })

  if (junior) {
    await endParkour(junior.id, kind, actor.id)
    const notice = await readDeparture(id)
    if (notice) return notice
  }

  const now = new Date()
  const trades = tradesOf(row)

  // Lives still to come no longer count on them
  await prisma.$transaction([
    prisma.liveMember.deleteMany({
      where: { accountId: id, live: { status: LiveStatuses.Announced } },
    }),
    prisma.eventAttendance.deleteMany({
      where: { accountId: id, event: { live: { status: LiveStatuses.Announced } } },
    }),
    prisma.legacyTrack.updateMany({
      where: { accountId: id, status: LegacyStatuses.Running },
      data: { status: LegacyStatuses.Cancelled },
    }),
  ])

  // Personal data erased
  await clearVolunteeredDetails(id)
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { accountId: id } }),
    prisma.discordToken.deleteMany({ where: { accountId: id } }),
    prisma.liveSuspension.updateMany({
      where: { accountId: id, liftedAt: null },
      data: { liftedAt: now },
    }),
    prisma.account.update({
      where: { id },
      data: {
        status:
          kind === DepartureKinds.Dismissal ? MemberStatuses.Dismissed : MemberStatuses.Resigned,
        leftAt: now,
        anonymisedAt: now,
      },
    }),
  ])

  // The announcement waits in the responsables' tasks
  const label = trades.length > 0 ? trades.join(' et ') : ROLE_REGISTRY.label(row.role)
  const notice = await prisma.departureNotice.create({
    data: {
      accountId: id,
      kind,
      functionName: label,
      body: fillDeparture(DEPARTURE_TEMPLATES[kind], DEPARTURE_VERBS, {
        username: row.discordUsername ?? row.displayName,
        discordId: row.discordId,
        functionName: label,
        emoji: trades.map((trade) => DEPARTURE_EMOJIS[trade] ?? '').join(' '),
        kind,
      }),
    },
  })

  const responsables = await prisma.account.findMany({
    where: { role: MemberRoles.Responsable, status: { notIn: GONE_MEMBER_STATUSES } },
    select: { id: true },
  })

  await notify({
    kind: 'PimDeparture',
    recipients: responsables.map((account) => account.id),
    actorId: actor.id,
    target: 'home',
    subject: row.displayName,
  })

  return toDeparture(notice)
}
