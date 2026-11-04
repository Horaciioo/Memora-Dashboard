import type { MemberParticipation, ParticipationRole } from '@/types/members'

/**
 * Creator a session belongs to
 * @typedef {Object} CreatorMark
 * @property {string} name - Creator name
 * @property {string | null} avatarUrl - Creator portrait
 */

export interface CreatorMark {
  name: string
  avatarUrl: string | null
}

/**
 * Creator fields of a line
 * @param {CreatorMark | null} creator - Creator, none when unknown
 * @return {Pick<MemberParticipation, 'youtuberName' | 'youtuberAvatar'>} - Name and portrait
 */

const creatorOf = (
  creator: CreatorMark | null
): Pick<MemberParticipation, 'youtuberName' | 'youtuberAvatar'> => ({
  youtuberName: creator?.name ?? null,
  youtuberAvatar: creator?.avatarUrl ?? null,
})

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
  youtuber: CreatorMark
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
  juniors: string[]
  youtuber: CreatorMark | null
}

/**
 * Live a member coordinated
 * @typedef {Object} CoordinationParticipationRow
 */

export interface CoordinationParticipationRow {
  id: string
  title: string
  startsAt: Date
  endsAt: Date | null
  youtuber: CreatorMark
  spentSeconds: number
  actions: number
}

// Counters of the lines that carry none
const NO_EXTRAS = {
  led: 0,
  observed: 0,
  juniors: [] as string[],
  spentSeconds: 0,
  actions: 0,
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
 * @param {CoordinationParticipationRow[]} [input.coordinations] - Lives coordinated
 * @param {Map<string, string>} input.promotionTitles - Title by promotion
 * @param {{ recruitment: boolean, academy: boolean, live?: boolean }} input.canOpen - Viewer reach
 * @return {MemberParticipation[]} - Latest first
 */

export const mergeParticipation = ({
  recruitments,
  promotions,
  coordinations = [],
  promotionTitles,
  canOpen,
}: {
  recruitments: RecruitmentParticipationRow[]
  promotions: AcademyParticipationRow[]
  coordinations?: CoordinationParticipationRow[]
  promotionTitles: Map<string, string>
  canOpen: { recruitment: boolean; academy: boolean; live?: boolean }
}): MemberParticipation[] => {
  // Archives deleted leave the file of the member
  const kept = recruitments.filter(
    (row) =>
      row.responsables.length > 0 ||
      ![...row.recruiters, ...row.observers].some((seat) => seat.forgottenAt)
  )

  const campaigns = kept.map((row): MemberParticipation => ({
    ...NO_EXTRAS,
    id: row.id,
    kind: 'recruitment',
    title: row.name,
    startsAt: (row.opensAt ?? row.createdAt).toISOString(),
    endsAt: row.closesAt?.toISOString() ?? null,
    roles: recruitmentRoles(row),
    led: row.candidates.filter((candidate) => candidate.recruiters.length > 0).length,
    observed: row.candidates.filter((candidate) => candidate.observers.length > 0).length,
    ...creatorOf(row.youtuber),
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
      ...NO_EXTRAS,
      ...creatorOf(row.youtuber),
      juniors: row.juniors,
      canOpen: canOpen.academy,
      ...temporaryState(row.trainers),
    }))

  const coordinated = coordinations.map((row): MemberParticipation => ({
    id: row.id,
    kind: 'coordination',
    title: row.title,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    roles: [],
    ...NO_EXTRAS,
    ...creatorOf(row.youtuber),
    spentSeconds: row.spentSeconds,
    actions: row.actions,
    canOpen: canOpen.live ?? false,
    isTemporary: false,
    isRevoked: false,
  }))

  return [...campaigns, ...trained, ...coordinated].sort((left, right) =>
    right.startsAt.localeCompare(left.startsAt)
  )
}
