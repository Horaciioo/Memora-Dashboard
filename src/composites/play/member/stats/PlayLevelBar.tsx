import { PLAY_STATS } from '@/declarations/ui/variants'

/**
 * Progress bar, from 0 to 100
 * @param {Object} props - Bar
 * @param {number} props.share - Percent filled
 * @param {boolean} [props.isThin] - Slim track
 * @return {JSX.Element}
 */

export const PlayLevelBar = ({ share, isThin }: { share: number; isThin?: boolean }) => (
  <span className={isThin ? PLAY_STATS.barThin : PLAY_STATS.bar}>
    <span className={PLAY_STATS.barFill} style={{ width: `${share}%` }} />
  </span>
)
