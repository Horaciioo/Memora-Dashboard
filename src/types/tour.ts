/**
 * Where a member stands in the first visit
 * @typedef {Object} TourState
 * @property {boolean} isIntroSeen - Admission and presentation done
 * @property {string[]} routes - Pages the member is walked through, in order
 * @property {string[]} seen - Pages already explained
 */

export interface TourState {
  isIntroSeen: boolean
  routes: string[]
  seen: string[]
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
