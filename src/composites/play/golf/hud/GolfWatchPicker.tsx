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
  isFree: boolean
  onFree: (on: boolean) => void
  // Held up or down, zero on release
  onRise: (sign: number) => void
}

/**
 * Key held to rise or sink
 * @param {Object} props - Direction
 * @param {1 | -1} props.sign - Up or down
 * @param {(sign: number) => void} props.onRise - Held sign
 * @return {JSX.Element}
 */

const RiseKey = ({ sign, onRise }: { sign: 1 | -1; onRise: (sign: number) => void }) => {
  const Icon = sign > 0 ? ICONS.golfRise : ICONS.golfSink

  return (
    <button
      type="button"
      className={GOLF_BOARD.watchMode}
      aria-label={sign > 0 ? GOLF_BOARD_COPY.flyRise : GOLF_BOARD_COPY.flySink}
      onPointerDown={() => onRise(sign)}
      onPointerUp={() => onRise(0)}
      onPointerLeave={() => onRise(0)}
      onPointerCancel={() => onRise(0)}
    >
      <Icon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
    </button>
  )
}

/**
 * Spectator picks the followed ball, or flies freely
 * @param {GolfWatchPickerProps} props - Players and gestures
 * @return {JSX.Element}
 */

export const GolfWatchPicker = ({ faces, watch, isFree, onFree, onRise }: GolfWatchPickerProps) => {
  const PreviousIcon = ICONS.playPrevious
  const NextIcon = ICONS.playNext
  const FollowIcon = ICONS.golfFollow
  const FlyIcon = ICONS.golfFly
  const modes = (
    <div className={GOLF_BOARD.watchModes}>
      <button
        type="button"
        className={cn(GOLF_BOARD.watchMode, !isFree && GOLF_BOARD.viewOn)}
        aria-label={GOLF_BOARD_COPY.watchPlayer}
        aria-pressed={!isFree}
        onClick={() => onFree(false)}
      >
        <FollowIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={cn(GOLF_BOARD.watchMode, isFree && GOLF_BOARD.viewOn)}
        aria-label={GOLF_BOARD_COPY.watchFree}
        aria-pressed={isFree}
        onClick={() => onFree(true)}
      >
        <FlyIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
      </button>
    </div>
  )

  // Free flight: avatars float over the balls, only height keys here
  if (isFree) {
    return (
      <div className={GOLF_BOARD.watch}>
        {modes}
        <RiseKey sign={1} onRise={onRise} />
        <RiseKey sign={-1} onRise={onRise} />
      </div>
    )
  }

  return (
    <div
      className={GOLF_BOARD.watch}
      onTouchStart={watch.onTouchStart}
      onTouchEnd={watch.onTouchEnd}
    >
      {modes}
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
