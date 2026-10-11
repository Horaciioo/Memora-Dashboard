import type { FieldDefinition } from '@/types/forms'

/**
 * Creator the visit puts a face on
 * @typedef {Object} TourCreator
 * @property {string} name - Creator name
 * @property {string | null} avatarUrl - Portrait
 */

export interface TourCreator {
  name: string
  avatarUrl: string | null
}

/**
 * Where a member stands in the first visit
 * @typedef {Object} TourState
 * @property {boolean} isIntroSeen - Admission and presentation done
 * @property {string[]} routes - Pages the member is walked through, in order
 * @property {string[]} seen - Pages already explained
 * @property {TourCreator | null} creator - Creator of the member's team
 * @property {FieldDefinition[]} socialFields - Social form the welcome asks, empty once it is done
 */

export interface TourState {
  isIntroSeen: boolean
  routes: string[]
  seen: string[]
  creator: TourCreator | null
  socialFields: FieldDefinition[]
}

/**
 * Box of a lit part
 * @typedef {Object} TourRect
 * @property {number} top - Top edge
 * @property {number} left - Left edge
 * @property {number} width - Width
 * @property {number} height - Height
 */

export interface TourRect {
  top: number
  left: number
  width: number
  height: number
}
