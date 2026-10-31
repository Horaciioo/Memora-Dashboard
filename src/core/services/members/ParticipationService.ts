import 'server-only'

import { prisma } from '@/core/lib/db'
import { mergeParticipation } from '@/core/lib/members/participation'
import { sessionNumbers } from '@/core/services/academy/sessionView'
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

  const [recruitments, promotions, numbers] = await Promise.all([
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
        opensAt: true,
        closesAt: true,
        createdAt: true,
        responsables: mine,
        recruiters: mine,
        observers: mine,
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
      select: { id: true, functionId: true, startsAt: true, endsAt: true, jobFunction: true },
    }),
    sessionNumbers(),
  ])

  const promotionTitles = new Map(
    promotions.map((row) => [
      row.id,
      sessionTitle({ function: { name: row.jobFunction.name }, number: numbers.get(row.id) ?? 1 }),
    ])
  )

  return mergeParticipation({
    recruitments,
    promotions,
    promotionTitles,
    canOpen: {
      recruitment:
        access.can(Permissions.RecruitmentRead) || access.can(Permissions.RecruitmentObserve),
      academy: access.can(Permissions.AcademyRead),
    },
  })
}
