'use client'

import { ICONS } from '@/declarations/ui/icons'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_BOARD } from '@/declarations/ui/variants'

/**
 * Pink arch with a trophy over the winner's name
 * @param {Object} props - Winners
 * @param {string[]} props.names - Names, tied ones together
 * @return {JSX.Element | null}
 */

export const GolfVictory = ({ names }: { names: string[] }) => {
  const TrophyIcon = ICONS.playTrophy
  if (names.length === 0) return null

  return (
    <div className={GOLF_BOARD.victory}>
      <span className={GOLF_BOARD.victoryArch} role="img" aria-label={GOLF_BOARD_COPY.victory}>
        <TrophyIcon className={GOLF_BOARD.victoryGlyph} aria-hidden="true" />
      </span>
      <span className={GOLF_BOARD.victoryName}>{names.join(' · ')}</span>
    </div>
  )
}
