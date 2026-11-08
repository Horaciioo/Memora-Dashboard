import { PlayHearts } from '@/composites/play/shared/PlayHearts'

/**
 * Lives of a Bomb Party seat, the shared row of hearts
 * @param {Object} props - Hearts
 * @param {number} props.lives - Lives left
 * @param {number} props.max - Ceiling
 * @return {JSX.Element}
 */

export const BombHearts = ({ lives, max }: { lives: number; max: number }) => (
  <PlayHearts lives={lives} max={max} />
)
