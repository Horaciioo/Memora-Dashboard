import { createEnumeration } from '@/core/lib/enumeration'

/**
 * Product modules enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const SYSTEM_MODULES = createEnumeration({
  Personal: { id: 0, label: 'Personnel' },
  Members: { id: 1, label: 'Modérateurs' },
  Projects: { id: 2, label: 'Projets' },
  Tasks: { id: 3, label: 'Tâches' },
  Meetings: { id: 4, label: 'Réunions' },
  Absences: { id: 5, label: 'Absences' },
  Livecon: { id: 6, label: 'Livecon' },
  Academy: { id: 7, label: 'Marsha Academy' },
  Moderation: { id: 8, label: 'Modération' },
  Settings: { id: 9, label: 'Configuration' },
})

export type SystemModuleName = keyof typeof SYSTEM_MODULES.ids
export type SystemModuleId = (typeof SYSTEM_MODULES.ids)[SystemModuleName]
