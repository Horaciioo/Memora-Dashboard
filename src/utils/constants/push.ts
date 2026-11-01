import { createEnumeration } from '@/core/lib/enumeration'

/**
 * Outcome of one push handed to a push service
 * @type {Enumeration<EnumerationSource>}
 */

export const PUSH_DELIVERY_STATUSES = createEnumeration({
  Pending: { id: 0, label: 'En attente' },
  Sent: { id: 1, label: 'Remise' },
  Failed: { id: 2, label: 'Échouée' },
  Expired: { id: 3, label: 'Appareil expiré' },
})

export type PushDeliveryStatusName = keyof typeof PUSH_DELIVERY_STATUSES.ids
