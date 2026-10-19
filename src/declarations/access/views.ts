import { createRegistry } from '@/core/lib/registry'
import { NavigationViews } from '@/declarations/navigation'
import type { NavigationViewName } from '@/declarations/navigation'
import type { IconName } from '@/declarations/ui/icons'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { Tone } from '@/declarations/ui/theme'

/**
 * Rail view metadata
 * @typedef {Object} NavigationViewOption
 * @property {string} label - Display name
 * @property {string} summary - What the view opens
 * @property {IconName} icon - Icon key
 * @property {Tone} tone - Colour the lightning takes
 * @property {boolean} scoped - Narrows down to a single creator
 */

interface NavigationViewOption {
  label: string
  summary: string
  icon: IconName
  tone: Tone
  scoped: boolean
}

const NAVIGATION_VIEW_MAP: Record<NavigationViewName, NavigationViewOption> = {
  [NavigationViews.Junior]: {
    label: 'Vue Junior',
    summary: 'Le parcours d’un Junior, de la PIM à sa première modération.',
    icon: 'academy',
    tone: 'caution',
    scoped: false,
  },
  [NavigationViews.Moderation]: {
    label: 'Vue Modérateur',
    summary: 'Le quotidien de la modération, livecon et sanctions compris.',
    icon: 'sanctions',
    tone: 'neutral',
    scoped: false,
  },
  [NavigationViews.Lead]: {
    label: 'Vue Responsable',
    summary: 'Le pilotage des équipes du YouTubeur que tu as en charge.',
    icon: 'lead',
    tone: 'authorityLead',
    scoped: true,
  },
  [NavigationViews.Administration]: {
    label: 'Vue Admin',
    summary: 'Tous les YouTubeurs, la configuration et l’état du back-end.',
    icon: 'console',
    tone: 'authorityAdmin',
    scoped: false,
  },
}

export const NAVIGATION_VIEW_REGISTRY = createRegistry(NAVIGATION_VIEW_MAP)

/**
 * Role whose glyph stands for each view on the switch
 * @type {Record<NavigationViewName, MemberRoleName>}
 */

export const VIEW_ROLES: Record<NavigationViewName, MemberRoleName> = {
  [NavigationViews.Junior]: MemberRoles.Junior,
  [NavigationViews.Moderation]: MemberRoles.Moderateur,
  [NavigationViews.Lead]: MemberRoles.Responsable,
  [NavigationViews.Administration]: MemberRoles.Admin,
}

/**
 * Colour each view takes on the switch: mauve, blue, orange, red
 * @type {Record<NavigationViewName, string>}
 */

export const VIEW_TINTS: Record<NavigationViewName, string> = {
  [NavigationViews.Junior]: 'var(--switch-mauve)',
  [NavigationViews.Moderation]: 'var(--switch-blue)',
  [NavigationViews.Lead]: 'var(--switch-orange)',
  [NavigationViews.Administration]: 'var(--switch-red)',
}

/**
 * Colour of the frame around the page
 * @typedef {'junior' | 'moderator' | 'lead' | 'admin'} ShellTone
 */

export type ShellTone = 'junior' | 'moderator' | 'lead' | 'admin'

/**
 * Frame tone of each view: the Junior deep orchid, the Moderator pink, lead orange, admin red
 * @type {Record<NavigationViewName, ShellTone>}
 */

const FRAME_TONES: Record<NavigationViewName, ShellTone> = {
  [NavigationViews.Junior]: 'junior',
  [NavigationViews.Moderation]: 'moderator',
  [NavigationViews.Lead]: 'lead',
  [NavigationViews.Administration]: 'admin',
}

/**
 * Frame tone of a view
 * @param {NavigationViewName} view - View in force
 * @return {ShellTone} - Tone the frame takes
 */

export const frameToneOf = (view: NavigationViewName): ShellTone => FRAME_TONES[view]
