import type { MemberParticipation, ParticipationRole } from '@/types/members'

/**
 * Recruitment session with only the viewed member's seats
 * @typedef {Object} RecruitmentParticipationRow
 */

export interface RecruitmentParticipationRow {
  id: string
  name: string
  opensAt: Date | null
  closesAt: Date | null
  createdAt: Date
  responsables: unknown[]
  recruiters: unknown[]
  observers: unknown[]
  candidates: { recruiters: unknown[]; observers: unknown[] }[]
}

/**
 * Academy promotion with only the viewed member's trainer seat
 * @typedef {Object} AcademyParticipationRow
 */

export interface AcademyParticipationRow {
  id: string
  startsAt: Date
  endsAt: Date | null
}

/**
 * Roles a recruitment row grants
 * @param {RecruitmentParticipationRow} row - Session row
 * @return {ParticipationRole[]} - Parts played
 */

const recruitmentRoles = (row: RecruitmentParticipationRow): ParticipationRole[] => {
  const led = row.candidates.some((candidate) => candidate.recruiters.length > 0)
  const sat = row.candidates.some((candidate) => candidate.observers.length > 0)

  const roles: [boolean, ParticipationRole][] = [
    [row.responsables.length > 0, 'responsable'],
    [row.recruiters.length > 0 || led, 'recruiter'],
    [row.observers.length > 0 || sat, 'observer'],
  ]

  return roles.filter(([held]) => held).map(([, role]) => role)
}

/**
 * Merge every seat of a member into one line per session
 * @param {Object} input - Rows read
 * @param {RecruitmentParticipationRow[]} input.recruitments - Campaigns
 * @param {AcademyParticipationRow[]} input.promotions - Promotions trained
 * @param {Map<string, string>} input.promotionTitles - Title by promotion
 * @param {{ recruitment: boolean, academy: boolean }} input.canOpen - Viewer reach
 * @return {MemberParticipation[]} - Latest first
 */

export const mergeParticipation = ({
  recruitments,
  promotions,
  promotionTitles,
  canOpen,
}: {
  recruitments: RecruitmentParticipationRow[]
  promotions: AcademyParticipationRow[]
  promotionTitles: Map<string, string>
  canOpen: { recruitment: boolean; academy: boolean }
}): MemberParticipation[] => {
  const campaigns = recruitments.map((row): MemberParticipation => ({
    id: row.id,
    kind: 'recruitment',
    title: row.name,
    startsAt: (row.opensAt ?? row.createdAt).toISOString(),
    endsAt: row.closesAt?.toISOString() ?? null,
    roles: recruitmentRoles(row),
    led: row.candidates.filter((candidate) => candidate.recruiters.length > 0).length,
    observed: row.candidates.filter((candidate) => candidate.observers.length > 0).length,
    canOpen: canOpen.recruitment,
  }))

  const trained = promotions.map((row): MemberParticipation => ({
    id: row.id,
    kind: 'academy',
    title: promotionTitles.get(row.id) ?? row.id,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    roles: ['trainer'],
    led: 0,
    observed: 0,
    canOpen: canOpen.academy,
  }))

  return [...campaigns, ...trained].sort((left, right) =>
    right.startsAt.localeCompare(left.startsAt)
  )
}
