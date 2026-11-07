'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import type { GolfFace } from '@/composites/play/golf/types'
import type { GolfWatch } from '@/core/hooks/interaction/golf/useGolfWatch'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface GolfWatchPickerProps {
  faces: GolfFace[]
  watch: GolfWatch
}

/**
 * Spectator picks the followed ball
 * @param {GolfWatchPickerProps} props - Players and gestures
 * @return {JSX.Element}
 */

export const GolfWatchPicker = ({ faces, watch }: GolfWatchPickerProps) => {
  const PreviousIcon = ICONS.playPrevious
  const NextIcon = ICONS.playNext

  return (
    <div
      className={GOLF_BOARD.watch}
      onTouchStart={watch.onTouchStart}
      onTouchEnd={watch.onTouchEnd}
    >
      <button
        type="button"
        className={GOLF_BOARD.watchFace}
        aria-label={GOLF_BOARD_COPY.watchPrevious}
        onClick={() => watch.step(-1)}
      >
        <PreviousIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
      </button>
      {faces.map((face) => (
        <button
          key={face.accountId}
          type="button"
          className={cn(
            GOLF_BOARD.watchFace,
            face.accountId === watch.focusId && GOLF_BOARD.watchFaceOn
          )}
          aria-label={fillPlayMessage(GOLF_BOARD_COPY.watchFollow, { name: face.name })}
          aria-pressed={face.accountId === watch.focusId}
          onClick={() => watch.select(face.accountId)}
        >
          <Avatar name={face.name} src={face.avatarUrl} size="md" />
        </button>
      ))}
      <button
        type="button"
        className={GOLF_BOARD.watchFace}
        aria-label={GOLF_BOARD_COPY.watchNext}
        onClick={() => watch.step(1)}
      >
        <NextIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
      </button>
    </div>
  )
}
