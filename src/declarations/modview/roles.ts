import type { IconName } from '@/declarations/ui/icons'
import type { MemoraRank } from '@/types/modview'

/**
 * Seat a teammate holds in the Mod View, the live Coordinator above the ranks
 * @typedef {MemoraRank | 'coordinator'} TeamRole
 */

export type TeamRole = MemoraRank | 'coordinator'

/**
 * Colour and initial glyph of each team role, the one source for the team and the chat
 * @type {Record<TeamRole, { label: string, icon: IconName, tone: string }>}
 */

export const TEAM_ROLES: Record<TeamRole, { label: string; icon: IconName; tone: string }> = {
  moderator: { label: 'Modérateur', icon: 'shield', tone: 'text-[var(--color-success)]' },
  coordinator: {
    label: 'Coordinateur',
    icon: 'coordinator',
    tone: 'text-[var(--color-gold-ink)]',
  },
  responsable: {
    label: 'Responsable',
    icon: 'legacy',
    tone: 'text-[var(--color-apple-orange)]',
  },
  admin: { label: 'Admin', icon: 'crown', tone: 'danger-shimmer' },
}

/**
 * Role a teammate shows right now, the Coordinator seat first
 * @param {MemoraRank | undefined} rank - Memora rank
 * @param {boolean} isCoordinator - Coordinating the live
 * @return {TeamRole | null} - Role, none for a Junior
 */

export const roleOf = (rank: MemoraRank | undefined, isCoordinator: boolean): TeamRole | null =>
  isCoordinator ? 'coordinator' : (rank ?? null)

// Order of the team list
export const TEAM_ORDER: TeamRole[] = ['coordinator', 'admin', 'responsable', 'moderator']

// Minutes a new arrival stays flagged
export const ARRIVAL_FRESH_MINUTES = 3
