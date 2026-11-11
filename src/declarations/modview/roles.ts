import type { ComponentType } from 'react'

import { ReferentFunctionGlyph } from '@/components/elements/display/glyphs/BrandGlyphs'
import { CoordinatorGlyph } from '@/components/elements/display/glyphs/LiveGlyphs'
import { ROLE_EMBLEMS } from '@/declarations/members/profiles'
import type { IconName } from '@/declarations/ui/icons'
import type { MemoraRank } from '@/types/modview'
import { MemberRoles } from '@/utils/constants/hierarchy'

type TeamSectionIcon = ComponentType<{ className?: string }>

/**
 * Seat a teammate holds in the Mod View, the live Coordinator above the ranks
 * @typedef {MemoraRank | 'coordinator'} TeamRole
 */

export type TeamRole = MemoraRank | 'coordinator'

// Bright tone of each seat, read by the shimmer and the glyph glow
const SHINE = {
  moderator: '[--shine:var(--color-apple-green)]',
  junior: '[--shine:color-mix(in_srgb,var(--color-apple-green)_65%,var(--color-surface))]',
  coordinator: '[--shine:var(--color-gold-400)]',
  responsable: '[--shine:var(--color-apple-orange)]',
  admin: '[--shine:var(--color-apple-red)]',
} as const

export const TEAM_JUNIOR_TONE = `team-shimmer ${SHINE.junior}`

const roleTone = (role: TeamRole) => ({
  // Name with a band of light crossing it
  tone: `team-shimmer ${SHINE[role]}`,
  // Glyph in the same colour, twinkling
  glyph: `team-glyph ${SHINE[role]}`,
})

/**
 * Colour and initial glyph of each team role, the one source for the team and the chat
 * @type {Record<TeamRole, { label: string, icon: IconName, tone: string, glyph: string }>}
 */

export const TEAM_ROLES: Record<
  TeamRole,
  { label: string; icon: IconName; tone: string; glyph: string }
> = {
  moderator: { label: 'Modérateur', icon: 'shield', ...roleTone('moderator') },
  coordinator: { label: 'Coordinateur', icon: 'coordinator', ...roleTone('coordinator') },
  responsable: { label: 'Responsable', icon: 'legacy', ...roleTone('responsable') },
  admin: { label: 'Admin', icon: 'crown', ...roleTone('admin') },
}

/**
 * Role a teammate shows right now, the Coordinator seat first
 * @param {MemoraRank | undefined} rank - Memora rank
 * @param {boolean} isCoordinator - Coordinating the live
 * @return {TeamRole | null} - Role, none for a Junior
 */

export const roleOf = (rank: MemoraRank | undefined, isCoordinator: boolean): TeamRole | null =>
  isCoordinator ? 'coordinator' : (rank ?? null)

/**
 * Section of the team list, from the top
 * @typedef {'administration' | 'coordination' | 'referents' | 'moderators' | 'juniors'} TeamSection
 */

export type TeamSection = 'administration' | 'coordination' | 'referents' | 'moderators' | 'juniors'

// Sections in order, each with its heading, glyph and tone
export const TEAM_SECTIONS: {
  key: TeamSection
  label: string
  glyph: TeamSectionIcon
}[] = [
  {
    key: 'administration',
    label: 'Administration',
    glyph: ROLE_EMBLEMS[MemberRoles.Admin].glyph,
  },
  {
    key: 'coordination',
    label: 'Coordination',
    glyph: CoordinatorGlyph,
  },
  {
    key: 'referents',
    label: 'Référents',
    glyph: ReferentFunctionGlyph,
  },
  {
    key: 'moderators',
    label: 'Modérateurs',
    glyph: ROLE_EMBLEMS[MemberRoles.Moderateur].glyph,
  },
  {
    key: 'juniors',
    label: 'Juniors',
    glyph: ROLE_EMBLEMS[MemberRoles.Junior].glyph,
  },
]

/**
 * Section a teammate sits in, the live's Coordinators first
 * @param {{ rank?: MemoraRank, isReferent?: boolean }} member - Teammate
 * @param {boolean} isCoordinator - Coordinating the live
 * @return {TeamSection} - Section
 */

export const sectionOf = (
  member: { rank?: MemoraRank; isReferent?: boolean },
  isCoordinator: boolean
): TeamSection => {
  if (isCoordinator) return 'coordination'
  if (member.rank === 'admin' || member.rank === 'responsable') return 'administration'
  if (!member.rank) return 'juniors'

  return member.isReferent ? 'referents' : 'moderators'
}

// Order of the team list
export const TEAM_ORDER: TeamRole[] = ['coordinator', 'admin', 'responsable', 'moderator']

// Minutes a new arrival stays flagged
export const ARRIVAL_FRESH_MINUTES = 3
