import type { MemberParticipation, ParticipationRole } from '@/types/members'

/**
 * State of a temporary seat
 * @typedef {Object} SeatFlags
 * @property {Date | null} revokedAt - Access taken back
 * @property {Date | null} forgottenAt - Archives deleted
 */

export interface SeatFlags {
  revokedAt: Date | null
  forgottenAt: Date | null
}

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
  recruiters: SeatFlags[]
  observers: SeatFlags[]
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
  trainers: SeatFlags[]
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
 * Whether the seats of a session are temporary, and whether their access was taken back
 * @param {SeatFlags[]} seats - Session-level seats of the member
 * @return {Pick<MemberParticipation, 'isTemporary' | 'isRevoked'>} - Flags of the line
 */

const temporaryState = (
  seats: SeatFlags[]
): Pick<MemberParticipation, 'isTemporary' | 'isRevoked'> => ({
  isTemporary: seats.length > 0,
  isRevoked: seats.length > 0 && seats.every((seat) => seat.revokedAt !== null),
})

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
  // Archives deleted leave the file of the member
  const kept = recruitments.filter(
    (row) =>
      row.responsables.length > 0 ||
      ![...row.recruiters, ...row.observers].some((seat) => seat.forgottenAt)
  )

  const campaigns = kept.map((row): MemberParticipation => ({
    id: row.id,
    kind: 'recruitment',
    title: row.name,
    startsAt: (row.opensAt ?? row.createdAt).toISOString(),
    endsAt: row.closesAt?.toISOString() ?? null,
    roles: recruitmentRoles(row),
    led: row.candidates.filter((candidate) => candidate.recruiters.length > 0).length,
    observed: row.candidates.filter((candidate) => candidate.observers.length > 0).length,
    canOpen: canOpen.recruitment,
    ...temporaryState([...row.recruiters, ...row.observers]),
  }))

  const trained = promotions
    .filter((row) => !row.trainers.some((seat) => seat.forgottenAt))
    .map((row): MemberParticipation => ({
    id: row.id,
    kind: 'academy',
    title: promotionTitles.get(row.id) ?? row.id,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    roles: ['trainer'],
    led: 0,
    observed: 0,
    canOpen: canOpen.academy,
    ...temporaryState(row.trainers),
  }))

  return [...campaigns, ...trained].sort((left, right) =>
    right.startsAt.localeCompare(left.startsAt)
  )
}
