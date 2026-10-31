import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { isAwaitingRecruitment } from '@/core/lib/academy/recruitmentGate'
import type { ParkourPhase } from '@/core/lib/academy/parkour'
import { toPerson } from '@/core/services/work/shared'
import type { SessionRecruitment, SessionSummary } from '@/types/academy'
import type { AcademySessionStatusName } from '@/utils/constants/hierarchy'

/**
 * Rank of each session among those of its function
 * @return {Promise<Map<string, number>>} - Number by session
 */

export const sessionNumbers = async (): Promise<Map<string, number>> => {
  const rows = await prisma.academySession.findMany({
    select: { id: true, functionId: true },
    orderBy: [{ startsAt: 'asc' }, { id: 'asc' }],
  })
  const seen = new Map<string, number>()

  return new Map(
    rows.map((row) => {
      const rank = (seen.get(row.functionId) ?? 0) + 1
      seen.set(row.functionId, rank)

      return [row.id, rank]
    })
  )
}

// Campaign relations a summary reads
export const CAMPAIGN_SHAPE = {
  select: {
    id: true,
    name: true,
    status: true,
    youtuber: { select: { id: true, name: true, avatarUrl: true } },
    responsables: {
      select: { account: { select: { id: true, displayName: true, avatarUrl: true } } },
    },
    candidates: {
      select: {
        recruiters: {
          select: { account: { select: { id: true, displayName: true, avatarUrl: true } } },
        },
      },
    },
  },
} as const

export type CampaignRow = Prisma.RecruitmentSessionGetPayload<typeof CAMPAIGN_SHAPE>

/**
 * Shape the campaign feeding a promotion
 * @param {CampaignRow | null} row - Campaign row
 * @return {SessionRecruitment | null} - Campaign view
 */

export const toCampaign = (row: CampaignRow | null): SessionRecruitment | null => {
  if (!row) return null

  // Every recruiter once
  const recruiters = new Map(
    row.candidates.flatMap((candidate) =>
      candidate.recruiters.map(({ account }) => [account.id, account] as const)
    )
  )

  return {
    id: row.id,
    name: row.name,
    status: row.status,
    youtuberId: row.youtuber.id,
    creator: row.youtuber.name,
    creatorImage: row.youtuber.avatarUrl,
    responsables: row.responsables
      .map((seat) => toPerson(seat.account))
      .filter((person) => person !== null),
    recruiters: [...recruiters.values()]
      .map((account) => toPerson(account))
      .filter((person) => person !== null),
  }
}

/**
 * Shape one session row
 * @param {Map<string, number>} numbers - Session ranks
 * @param {object} row - Session row with its trainers and counts
 * @return {SessionSummary} - Session summary
 */

export const toSummary = (
  numbers: Map<string, number>,
  row: {
    id: string
    functionId: string
    startsAt: Date
    endsAt: Date | null
    status: AcademySessionStatusName
    secondPeriodAt: Date | null
    jobFunction: {
      id: string
      name: string
      summary: string | null
      accent: string | null
      icon: string | null
    }
    trainers: { account: { id: string; displayName: string; avatarUrl: string | null } }[]
    _count: { juniors: number }
    invites: { token: string; expiresAt: Date; maxUses: number | null; uses: number }[]
    recruitmentSession: CampaignRow | null
  },
  phases: ParkourPhase[] = []
): SessionSummary => {
  const invite = row.invites[0]
  const inviteUsable =
    invite && invite.expiresAt > new Date() && invite.uses < (invite.maxUses ?? Infinity)

  return {
    id: row.id,
    number: numbers.get(row.id) ?? 1,
    function: row.jobFunction,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    status: row.status,
    secondPeriodAt: row.secondPeriodAt?.toISOString() ?? null,
    trainers: row.trainers
      .map((seat) => toPerson(seat.account))
      .filter((person) => person !== null),
    juniorCount: row._count.juniors,
    inviteToken: inviteUsable ? invite.token : null,
    phases,
    recruitment: toCampaign(row.recruitmentSession),
    awaitingRecruitment: isAwaitingRecruitment(row.status, row.recruitmentSession?.status ?? null),
    values: {
      functionId: row.functionId,
      status: row.status,
      period: [
        row.startsAt.toISOString().slice(0, 10),
        (row.endsAt ?? row.startsAt).toISOString().slice(0, 10),
      ],
      trainerIds: row.trainers.map((seat) => seat.account.id),
    },
  }
}

// Everything a session row needs to become a summary
export const SESSION_SHAPE = {
  jobFunction: true,
  trainers: { include: { account: true } },
  _count: { select: { juniors: true } },
  invites: { orderBy: { createdAt: 'desc' as const }, take: 1 },
  recruitmentSession: CAMPAIGN_SHAPE,
} as const
