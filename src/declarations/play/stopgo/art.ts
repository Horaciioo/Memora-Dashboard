/**
 * Hub and room ground of Stop & Go
 * @type {Object}
 */

export const STOPGO_HUB = {
  ground: 'play-road',
} as const

/**
 * Car colour, one per seat
 * @type {string}
 */

export type StopGoCarColor = 'red' | 'blue' | 'green' | 'yellow'
