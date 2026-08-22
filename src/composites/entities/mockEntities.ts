import type { Entity } from '@/types/entity'
import { ENTITY_STATUSES } from '@/utils/constants'

/** @type {Entity[]} */
export const MOCK_ENTITIES: Entity[] = [
  { id: '1', name: 'Alpha', status: ENTITY_STATUSES.ids.Active, updatedAt: '2026-08-01' },
  { id: '2', name: 'Bravo', status: ENTITY_STATUSES.ids.Pending, updatedAt: '2026-07-28' },
  { id: '3', name: 'Charlie', status: ENTITY_STATUSES.ids.Active, updatedAt: '2026-07-20' },
  { id: '4', name: 'Delta', status: ENTITY_STATUSES.ids.Suspended, updatedAt: '2026-06-30' },
]
