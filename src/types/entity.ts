import type { EntityStatusId } from '@/utils/constants'

// Entity status identifier
export type EntityStatus = EntityStatusId

// Entity data model
export interface Entity {
  id: string
  name: string
  status: EntityStatus
  updatedAt: string
}
