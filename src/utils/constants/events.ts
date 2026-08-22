import { createEnumeration } from '@/core/lib/enumeration'

/**
 * Loggable event enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const EVENT_TYPES = createEnumeration({
  EntityCreated: { id: 0, label: 'Entity created' },
  EntityUpdated: { id: 1, label: 'Entity updated' },
  EntityDeleted: { id: 2, label: 'Entity deleted' },
  StatusChanged: { id: 3, label: 'Status changed' },
  PermissionGranted: { id: 4, label: 'Permission granted' },
  PermissionRevoked: { id: 5, label: 'Permission revoked' },
  SessionOpened: { id: 6, label: 'Session opened' },
  SessionClosed: { id: 7, label: 'Session closed' },
  SettingChanged: { id: 8, label: 'Setting changed' },
  RuleTriggered: { id: 9, label: 'Rule triggered' },
})

export type EventTypeName = keyof typeof EVENT_TYPES.ids
export type EventTypeId = (typeof EVENT_TYPES.ids)[EventTypeName]

/**
 * Event origin enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const EVENT_ORIGINS = createEnumeration({
  User: { id: 0, label: 'User' },
  System: { id: 1, label: 'System' },
  Automation: { id: 2, label: 'Automation' },
  Integration: { id: 3, label: 'Integration' },
  Scheduler: { id: 4, label: 'Scheduler' },
})

export type EventOriginName = keyof typeof EVENT_ORIGINS.ids
export type EventOriginId = (typeof EVENT_ORIGINS.ids)[EventOriginName]
