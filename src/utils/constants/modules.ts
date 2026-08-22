import { createEnumeration } from '@/core/lib/enumeration'

/**
 * System modules enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const SYSTEM_MODULES = createEnumeration({
  Access: { id: 0, label: 'Access' },
  Content: { id: 1, label: 'Content' },
  Automation: { id: 2, label: 'Automation' },
  Reporting: { id: 3, label: 'Reporting' },
  Notifications: { id: 4, label: 'Notifications' },
  Integrations: { id: 5, label: 'Integrations' },
})

export type SystemModuleName = keyof typeof SYSTEM_MODULES.ids
export type SystemModuleId = (typeof SYSTEM_MODULES.ids)[SystemModuleName]
