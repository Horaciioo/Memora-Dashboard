import { FunctionNames } from '@/declarations/reference/fixed'
import { createRegistry } from '@/core/lib/registry'
import { DEFAULT_ZONE } from '@/declarations/ui/dates'
import type { IconName } from '@/declarations/ui/icons'
import type { Tone } from '@/declarations/ui/theme'
import { LivePlatforms, LiveStatuses } from '@/utils/constants/lives'
import type { LivePlatformName, LiveStatusName } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

/**
 * How a platform reads on screen
 * @typedef {Object} LivePlatformOption
 * @property {string} label - Platform name
 * @property {IconName} icon - Platform glyph
 * @property {string} watchUrl - Public channel address
 */

interface LivePlatformOption {
  label: string
  icon: IconName
  watchUrl: string
}

const LIVE_PLATFORM_MAP: Record<LivePlatformName, LivePlatformOption> = {
  [LivePlatforms.Twitch]: {
    label: 'Twitch',
    icon: 'twitch',
    watchUrl: 'https://www.twitch.tv/{login}',
  },
  [LivePlatforms.YouTube]: {
    label: 'YouTube',
    icon: 'youtube',
    watchUrl: 'https://www.youtube.com/@{login}/live',
  },
}

export const LIVE_PLATFORM_REGISTRY = createRegistry(LIVE_PLATFORM_MAP)

/**
 * Platforms whose lives Memora cannot hold yet
 * @type {readonly LivePlatformName[]}
 */

export const LIVE_PLATFORMS_SOON: readonly LivePlatformName[] = [LivePlatforms.YouTube]

/**
 * How a live status reads on screen
 * @typedef {Object} LiveStatusOption
 * @property {string} label - Status name
 * @property {Tone} tone - Colour family
 */

interface LiveStatusOption {
  label: string
  tone: Tone
}

const LIVE_STATUS_MAP: Record<LiveStatusName, LiveStatusOption> = {
  [LiveStatuses.Announced]: { label: 'Annoncé', tone: 'caution' },
  [LiveStatuses.Live]: { label: 'En direct', tone: 'danger' },
  [LiveStatuses.Ended]: { label: 'Terminé', tone: 'neutral' },
  [LiveStatuses.Cancelled]: { label: 'Annulé', tone: 'neutral' },
}

export const LIVE_STATUS_REGISTRY = createRegistry(LIVE_STATUS_MAP)

/**
 * Zone the team reads clock times in
 * @type {string}
 */

export const LIVE_CLOCK_ZONE = DEFAULT_ZONE

/**
 * Live coordinator
 * @type {{ label: string, icon: IconName, tint: string, grants: readonly PermissionName[] }}
 */

export const LIVE_COORDINATOR = {
  label: 'Coordinateur du Live',
  icon: 'coordinator' as IconName,
  tint: 'COORDINATOR',
  grants: [
    Permissions.LiveModeEmotes,
    Permissions.LiveModeSlow,
    Permissions.LiveTerms,
    Permissions.LivePin,
    Permissions.LiveRoster,
  ],
} as const

/**
 * Functions whose holders a live convenes by default
 * @type {readonly string[]}
 */

export const LIVE_FUNCTIONS: readonly string[] = [FunctionNames.Lives, FunctionNames.JuniorLives]

// Discord trade only
export const DISCORD_FUNCTIONS: string[] = [FunctionNames.Discord, FunctionNames.JuniorDiscord]

/**
 * How the bilan names a moderator who is not from the Live team, by function held
 * @type {Record<string, string>}
 */

export const LIVE_OUTSIDE_LABELS: Record<string, string> = {
  [FunctionNames.Discord]: 'Mod. Discord',
  [FunctionNames.JuniorDiscord]: 'Mod. Discord',
}

/**
 * Name given to any other moderator from outside the Live team
 * @type {string}
 */

export const LIVE_OUTSIDE_DEFAULT = 'Hors équipe Live'

/**
 * Focus reaches disconnected members too, for the visual checks of a dev build
 * @type {boolean}
 */

export const FOCUS_OFFLINE_ALLOWED = process.env.NODE_ENV !== 'production'

/**
 * Calendar preset opening the form on the Live template
 * @type {string}
 */

export const LIVE_PRESET = 'live'
