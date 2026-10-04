import { createRegistry } from '@/core/lib/registry'
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
 * @property {string} watchUrl - Public channel address, {login} filled in
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
 * Live coordinator, a secondary function held for one live only
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
    Permissions.LiveRoster,
  ],
} as const

/**
 * Functions whose holders a live convenes by default
 * @type {readonly string[]}
 */

export const LIVE_FUNCTIONS: readonly string[] = ['Lives', 'Junior Lives']

/**
 * Calendar template every announced live is filed under
 * @type {string}
 */

export const LIVE_EVENT_TEMPLATE = 'Live'
