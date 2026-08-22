import { createEnumeration } from '@/core/lib/enumeration'

/**
 * Resource action enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const ACTION_TYPES = createEnumeration({
  Create: { id: 0, label: 'Créer' },
  Read: { id: 1, label: 'Ouvrir' },
  Update: { id: 2, label: 'Modifier' },
  Delete: { id: 3, label: 'Supprimer' },
  Duplicate: { id: 4, label: 'Dupliquer' },
  Assign: { id: 5, label: 'Attribuer' },
  Archive: { id: 6, label: 'Archiver' },
  Copy: { id: 7, label: 'Copier le lien' },
})

export type ActionTypeName = keyof typeof ACTION_TYPES.ids
export type ActionTypeId = (typeof ACTION_TYPES.ids)[ActionTypeName]
