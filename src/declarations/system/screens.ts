import { VIEW_COPY } from '@/declarations/access/copy'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { PUSH_CONSOLE_COPY } from '@/declarations/pwa/copy'
import type { MaturityName } from '@/declarations/maturity/registries'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Route key one system screen answers on
 * @type {'storage' | 'journal' | 'queues' | 'push' | 'probes' | 'analytics' | 'health' | 'privileged' | 'administration'}
 */

export type SystemRouteKey =
  | 'storage'
  | 'journal'
  | 'queues'
  | 'push'
  | 'probes'
  | 'analytics'
  | 'health'
  | 'privileged'
  | 'administration'

/**
 * Hub groups
 * @type {'monitoring' | 'data' | 'administration'}
 */

export type SystemGroupKey = 'monitoring' | 'data' | 'administration'

/**
 * Hub groups in display order
 * @type {{ key: SystemGroupKey, label: string }[]}
 */

export const SYSTEM_GROUPS: { key: SystemGroupKey; label: string }[] = [
  { key: 'monitoring', label: SYSTEM_COPY.groupMonitoring },
  { key: 'data', label: SYSTEM_COPY.groupData },
  { key: 'administration', label: SYSTEM_COPY.groupAdministration },
]

/**
 * Screen of the system section
 * @typedef {Object} SystemScreen
 * @property {SystemRouteKey} route - Route key
 * @property {SystemGroupKey} group - Hub group
 * @property {string} label - Display label
 * @property {string} description - What the screen opens
 * @property {IconName} icon - Icon key
 * @property {MaturityName} [maturity] - Lifecycle stage shown as a tag
 */

export interface SystemScreen {
  route: SystemRouteKey
  group: SystemGroupKey
  label: string
  description: string
  icon: IconName
  maturity?: MaturityName
}

/**
 * System screens in display order
 * @type {SystemScreen[]}
 */

export const SYSTEM_SCREENS: SystemScreen[] = [
  {
    route: 'storage',
    group: 'data',
    label: SYSTEM_COPY.storageTitle,
    description: SYSTEM_COPY.storageLead,
    icon: 'storage',
  },
  {
    route: 'journal',
    group: 'data',
    label: SYSTEM_COPY.journalTitle,
    description: SYSTEM_COPY.journalLead,
    icon: 'journal',
  },
  {
    route: 'queues',
    group: 'data',
    label: SYSTEM_COPY.queuesTitle,
    description: SYSTEM_COPY.queuesLead,
    icon: 'queue',
  },
  {
    route: 'push',
    group: 'monitoring',
    label: PUSH_CONSOLE_COPY.title,
    description: PUSH_CONSOLE_COPY.lead,
    icon: 'bell',
  },
  {
    route: 'probes',
    group: 'monitoring',
    label: SYSTEM_COPY.probesTitle,
    description: SYSTEM_COPY.probesLead,
    icon: 'scan',
  },
  {
    route: 'analytics',
    group: 'monitoring',
    label: SYSTEM_COPY.analyticsTitle,
    description: SYSTEM_COPY.analyticsLead,
    icon: 'analytics',
  },
  {
    route: 'health',
    group: 'monitoring',
    label: SYSTEM_COPY.healthTitle,
    description: SYSTEM_COPY.healthLead,
    icon: 'metrics',
  },
  {
    route: 'privileged',
    group: 'administration',
    label: SYSTEM_COPY.privilegedTitle,
    description: SYSTEM_COPY.privilegedLead,
    icon: 'employee',
  },
  {
    route: 'administration',
    group: 'administration',
    label: VIEW_COPY.adminTitle,
    description: VIEW_COPY.adminLead,
    icon: 'console',
  },
]

/**
 * Screens of one hub group
 * @param {SystemGroupKey} group - Hub group
 * @return {SystemScreen[]} - Screens in display order
 */

export const systemScreensOfGroup = (group: SystemGroupKey): SystemScreen[] =>
  SYSTEM_SCREENS.filter((screen) => screen.group === group)
