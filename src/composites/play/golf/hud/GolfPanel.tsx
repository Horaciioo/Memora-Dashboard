'use client'

import { useState } from 'react'

import { GolfLog } from '@/composites/play/golf/hud/GolfLog'
import { GolfRoundTable } from '@/composites/play/golf/hud/GolfRoundTable'
import type { GolfFace } from '@/composites/play/golf/types'
import type { GolfBoardState } from '@/core/lib/play/golf'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_PANEL } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface GolfPanelProps {
  board: GolfBoardState
  faces: GolfFace[]
  viewerId: string
  focusId: string
  onStats: () => void
}

/**
 * Score card bottom left: feed, round table, ranking key
 * @param {GolfPanelProps} props - Board and view
 * @return {JSX.Element}
 */

export const GolfPanel = ({ board, faces, viewerId, focusId, onStats }: GolfPanelProps) => {
  const [isOpen, setOpen] = useState(true)
  const TrophyIcon = ICONS.trophy
  const ChevronIcon = ICONS.expand

  return (
    <aside className={GOLF_PANEL.root} aria-label={GOLF_BOARD_COPY.scorecard}>
      <GolfLog board={board} faces={faces} />
      <div className={GOLF_PANEL.head}>
        <h2 className={GOLF_PANEL.title}>{GOLF_BOARD_COPY.scorecard}</h2>
        <div className={GOLF_PANEL.keys}>
          <button
            type="button"
            className={GOLF_PANEL.key}
            aria-label={GOLF_BOARD_COPY.ranking}
            onClick={onStats}
          >
            <TrophyIcon className={GOLF_PANEL.keyIcon} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={GOLF_PANEL.key}
            aria-label={isOpen ? GOLF_BOARD_COPY.collapse : GOLF_BOARD_COPY.expand}
            aria-expanded={isOpen}
            onClick={() => setOpen(!isOpen)}
          >
            <ChevronIcon
              className={cn(GOLF_PANEL.keyIcon, !isOpen && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <div className={cn(GOLF_PANEL.fold, isOpen && GOLF_PANEL.foldOpen)} inert={!isOpen}>
        <div className={GOLF_PANEL.foldClip}>
          <GolfRoundTable
            players={board.players}
            faces={faces}
            hole={board.hole}
            viewerId={viewerId}
            focusId={focusId}
          />
        </div>
      </div>
    </aside>
  )
}
