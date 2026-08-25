import { createRegistry } from '@/core/lib/registry'
import { NavigationViews } from '@/declarations/navigation'
import type { NavigationViewName } from '@/declarations/navigation'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Rail view metadata
 * @typedef {Object} NavigationViewOption
 * @property {string} label - Display name
 * @property {string} summary - What the view opens
 * @property {IconName} icon - Icon key
 */

interface NavigationViewOption {
  label: string
  summary: string
  icon: IconName
}

const NAVIGATION_VIEW_MAP: Record<NavigationViewName, NavigationViewOption> = {
  [NavigationViews.Moderation]: {
    label: 'Vue Modérateur',
    summary: 'Le quotidien de la modération, livecon et sanctions compris.',
    icon: 'sanctions',
  },
  [NavigationViews.Administration]: {
    label: 'Vue Admin',
    summary: 'Le pilotage, les équipes et la configuration de la Corp.',
    icon: 'flash',
  },
}

export const NAVIGATION_VIEW_REGISTRY = createRegistry(NAVIGATION_VIEW_MAP)
