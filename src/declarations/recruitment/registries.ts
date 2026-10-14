import { createRegistry } from '@/core/lib/registry'
import {
  RecruitmentOwners,
  RecruitmentPlatforms,
  RecruitmentStatuses,
} from '@/utils/constants/recruitment'
import type { IconName } from '@/declarations/ui/icons'
import type {
  RecruitmentOwnerName,
  RecruitmentPlatformName,
  RecruitmentStatusName,
} from '@/utils/constants/recruitment'

/**
 * Labelled option carrying a colour token
 * @typedef {Object} RecruitmentOption
 * @property {string} label - Display label
 * @property {string} accent - Colour token
 * @property {IconName} [icon] - Role glyph
 */

interface RecruitmentOption {
  label: string
  accent: string
  icon?: IconName
}

const STATUS_MAP: Record<RecruitmentStatusName, RecruitmentOption> = {
  [RecruitmentStatuses.Draft]: { label: 'Préparée', accent: 'neutral' },
  [RecruitmentStatuses.Announced]: { label: 'Annoncée', accent: 'warning' },
  [RecruitmentStatuses.Interviews]: { label: 'Entretiens', accent: 'success' },
  [RecruitmentStatuses.Closed]: { label: 'Clôturée', accent: 'info' },
  [RecruitmentStatuses.Archived]: { label: 'Archivée', accent: 'neutral' },
}

export const RECRUITMENT_STATUS_REGISTRY = createRegistry(STATUS_MAP)

const OWNER_MAP: Record<RecruitmentOwnerName, RecruitmentOption> = {
  [RecruitmentOwners.Responsable]: { label: 'Responsable', accent: 'warning', icon: 'flame' },
  [RecruitmentOwners.Recruteurs]: {
    label: 'Recruteurs',
    accent: 'brand',
    icon: 'functionRecruiter',
  },
  [RecruitmentOwners.Both]: { label: 'Responsable + Recruteurs', accent: 'info', icon: 'teams' },
}

export const RECRUITMENT_OWNER_REGISTRY = createRegistry(OWNER_MAP)

const PLATFORM_MAP: Record<RecruitmentPlatformName, RecruitmentOption> = {
  [RecruitmentPlatforms.Discord]: { label: 'Discord', accent: 'info', icon: 'discord' },
  [RecruitmentPlatforms.Twitch]: { label: 'Twitch', accent: 'brand', icon: 'twitch' },
}

export const RECRUITMENT_PLATFORM_REGISTRY = createRegistry(PLATFORM_MAP)

/**
 * Platform a trade is recruited on, Discord when absent
 * @type {Readonly<Record<string, RecruitmentPlatformName>>}
 */

export const PLATFORM_OF_TRADE: Readonly<Record<string, RecruitmentPlatformName>> = {
  Lives: RecruitmentPlatforms.Twitch,
}

/**
 * Hours a recruitment opens and closes at, on its first and last day
 * @type {readonly [string, string]}
 */

export const RECRUITMENT_PERIOD_TIMES = ['00:00', '18:30'] as const
