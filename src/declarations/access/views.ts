import { createRegistry } from '@/core/lib/registry'
import { NavigationViews } from '@/declarations/navigation'
import type { NavigationViewName } from '@/declarations/navigation'
import type { IconName } from '@/declarations/ui/icons'
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
