import { SYSTEM_COPY } from '@/declarations/system/copy'
import type { MaturityName } from '@/declarations/maturity/registries'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Route key one system screen answers on
 * @type {'storage' | 'journal' | 'queues' | 'probes' | 'analytics'}
 */

export type SystemRouteKey = 'storage' | 'journal' | 'queues' | 'probes' | 'analytics'

/**
 * Screen of the system section
 * @typedef {Object} SystemScreen
 * @property {SystemRouteKey} route - Route key
 * @property {string} label - Display label
 * @property {string} description - What the screen opens
 * @property {IconName} icon - Icon key
 * @property {MaturityName} [maturity] - Lifecycle stage shown as a tag
 */

export interface SystemScreen {
  route: SystemRouteKey
  label: string
  description: string
  icon: IconName
  maturity?: MaturityName
}

/**
 * System screens in display order, read by the rail and by the section index alike
 * @type {SystemScreen[]}
 */

export const SYSTEM_SCREENS: SystemScreen[] = [
  {
    route: 'storage',
    label: SYSTEM_COPY.storageTitle,
    description: SYSTEM_COPY.storageLead,
    icon: 'storage',
  },
  {
    route: 'journal',
    label: SYSTEM_COPY.journalTitle,
    description: SYSTEM_COPY.journalLead,
    icon: 'journal',
  },
  {
    route: 'queues',
    label: SYSTEM_COPY.queuesTitle,
    description: SYSTEM_COPY.queuesLead,
    icon: 'queue',
  },
  {
    route: 'probes',
    label: SYSTEM_COPY.probesTitle,
    description: SYSTEM_COPY.probesLead,
    icon: 'scan',
  },
  {
    route: 'analytics',
    label: SYSTEM_COPY.analyticsTitle,
    description: SYSTEM_COPY.analyticsLead,
    icon: 'analytics',
    maturity: 'dev',
  },
]
