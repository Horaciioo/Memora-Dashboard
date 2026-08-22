import { createEnumeration } from '@/core/lib/enumeration'

/**
 * Action enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const ACTION_TYPES = createEnumeration({
  Create: { id: 0, label: 'Create' },
  Read: { id: 1, label: 'Read' },
  Update: { id: 2, label: 'Update' },
  Delete: { id: 3, label: 'Delete' },
  Restore: { id: 4, label: 'Restore' },
  Export: { id: 5, label: 'Export' },
  Import: { id: 6, label: 'Import' },
  Share: { id: 7, label: 'Share' },
})

export type ActionTypeName = keyof typeof ACTION_TYPES.ids
export type ActionTypeId = (typeof ACTION_TYPES.ids)[ActionTypeName]
