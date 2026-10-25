import { SECOND_MS } from '@/utils/constants/time'

/**
 * Moment past a delay
 * @param {Date} from - Start
 * @param {number} seconds - Delay
 * @return {Date} - Later moment
 */

export const after = (from: Date, seconds: number): Date =>
  new Date(from.getTime() + seconds * SECOND_MS)
