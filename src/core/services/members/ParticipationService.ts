import 'server-only'

import { prisma } from '@/core/lib/db'
import { mergeParticipation } from '@/core/lib/members/participation'
import { sessionNumbers } from '@/core/services/academy/sessionView'
import { CoordinationStatuses } from '@/utils/constants/lives'
import type { PermissionHelpers } from '@/types/auth'
import type { MemberParticipation } from '@/types/members'
import { sessionTitle } from '@/utils/format/academy'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Sessions a member took part in, whatever their roles
 * @param {string} accountId - Member
 * @param {PermissionHelpers} access - Viewer permissions
 * @return {Promise<MemberParticipation[]>} - Latest first
 */

export const readMemberParticipation = async (
  accountId: string,
  access: PermissionHelpers
): Promise<MemberParticipation[]> => {
  const mine = { where: { accountId }, select: { accountId: true } }
  const seat = { where: { accountId }, select: { revokedAt: true, forgottenAt: true } }

  const creator = { select: { name: true, avatarUrl: true } }

  const [recruitments, promotions, coordinated, numbers] = await Promise.all([
    prisma.recruitmentSession.findMany({
      where: {
        OR: [
          { responsables: { some: { accountId } } },
          { recruiters: { some: { accountId } } },
          { observers: { some: { accountId } } },
          { candidates: { some: { recruiters: { some: { accountId } } } } },
          { candidates: { some: { observers: { some: { accountId } } } } },
        ],
      },
      select: {
        id: true,
        name: true,
        youtuber: creator,
        opensAt: true,
        closesAt: true,
        createdAt: true,
        responsables: mine,
        recruiters: seat,
        observers: seat,
        candidates: {
          where: {
            OR: [{ recruiters: { some: { accountId } } }, { observers: { some: { accountId } } }],
          },
          select: { recruiters: mine, observers: mine },
        },
      },
    }),
    prisma.academySession.findMany({
      where: { trainers: { some: { accountId } } },
      select: {
        id: true,
        functionId: true,
        startsAt: true,
        endsAt: true,
        jobFunction: true,
        trainers: seat,
        recruitmentSession: { select: { youtuber: creator } },
        juniors: {
          where: { trainerId: accountId },
          orderBy: { startedAt: 'asc' },
          select: { account: { select: { displayName: true } } },
        },
      },
    }),
    prisma.liveCoordination.findMany({
      where: { accountId, status: CoordinationStatuses.Accepted },
      select: {
        liveId: true,
        startsAt: true,
        endsAt: true,
        live: {
          select: { title: true, plannedStartAt: true, plannedEndAt: true, youtuber: creator },
        },
      },
    }),
    sessionNumbers(),
  ])

  const promotionTitles = new Map(
    promotions.map((row) => [
      row.id,
      sessionTitle({ function: { name: row.jobFunction.name }, number: numbers.get(row.id) ?? 1 }),
    ])
  )

  const liveIds = coordinated.map((row) => row.liveId)
  const [presences, gestures] = await Promise.all([
    prisma.modViewPresence.groupBy({
      by: ['liveId'],
      where: { accountId, liveId: { in: liveIds } },
      _sum: { visibleSeconds: true },
    }),
    prisma.moderationAction.groupBy({
      by: ['liveId'],
      where: { actorAccountId: accountId, liveId: { in: liveIds } },
      _count: { _all: true },
    }),
  ])
  const spent = new Map(presences.map((row) => [row.liveId, row._sum.visibleSeconds ?? 0]))
  const made = new Map(gestures.map((row) => [row.liveId, row._count._all]))

  return mergeParticipation({
    recruitments,
    promotions: promotions.map(({ recruitmentSession, juniors, ...row }) => ({
      ...row,
      juniors: juniors.map((junior) => junior.account.displayName),
      youtuber: recruitmentSession?.youtuber ?? null,
    })),
    coordinations: coordinated.map((row) => ({
      id: row.liveId,
      title: row.live.title,
      startsAt: row.startsAt ?? row.live.plannedStartAt,
      endsAt: row.endsAt ?? row.live.plannedEndAt,
      youtuber: row.live.youtuber,
      spentSeconds: spent.get(row.liveId) ?? 0,
      actions: made.get(row.liveId) ?? 0,
    })),
    promotionTitles,
    canOpen: {
      recruitment:
        access.can(Permissions.RecruitmentRead) || access.can(Permissions.RecruitmentObserve),
      academy: access.can(Permissions.AcademyRead),
      live: access.can(Permissions.LiveRead),
    },
  })
}
