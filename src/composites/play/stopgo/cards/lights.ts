import type { StopGoBoardView } from '@/core/lib/play/stopgo'

export type StopGoLight = 'green' | 'red' | 'broken'

/**
 * Light of a car: red after a red light or without go, broken after any other malus
 * @param {StopGoBoardView['players'][number]} player - Car
 * @return {StopGoLight} - Light
 */

export const lightOf = (player: StopGoBoardView['players'][number]): StopGoLight => {
  if (player.hazards.includes('red') || (!player.isGreen && !player.shields.includes('siren'))) {
    return 'red'
  }

  return player.isMoving ? 'green' : 'broken'
}
