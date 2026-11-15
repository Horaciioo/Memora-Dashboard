import { StopGoCardGlyph } from '@/composites/play/stopgo/art/StopGoCardGlyph'
import { remedyOf } from '@/composites/play/stopgo/cards/reasons'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import { fillPlayMessage } from '@/declarations/play/copy'
import { StopGoJokers } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_CARD_COPY, STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import { cn } from '@/utils/classnames'

type Player = StopGoBoardView['players'][number]

export interface StopGoCarStateProps {
  player: Player
  name: string
  isMe?: boolean
  canCleanup?: boolean
  isSaving?: boolean
  onCleanup?: () => void
}

/**
 * State of one car: rolling or stopped, malus with the card that lifts each, Jokers
 * @param {StopGoCarStateProps} props - Car
 * @return {JSX.Element}
 */

export const StopGoCarState = ({
  player,
  name,
  isMe = false,
  canCleanup = false,
  isSaving = false,
  onCleanup,
}: StopGoCarStateProps) => {
  const state = isMe
    ? player.isMoving
      ? STOPGO_HAND_COPY.rolling
      : STOPGO_HAND_COPY.stopped
    : player.isMoving
      ? STOPGO_HAND_COPY.rivalRolling
      : STOPGO_HAND_COPY.rivalStopped
  const hazards = player.hazards.filter((hazard) => hazard !== 'limit' || player.isLimited)

  return (
    <section className={STOPGO_HAND.panel} aria-label={name}>
      <h3 className={STOPGO_HAND.panelTitle}>{isMe ? STOPGO_HAND_COPY.myCar : name}</h3>
      <p className={STOPGO_HAND.state}>
        {state}
        {player.isLimited &&
          `. ${fillPlayMessage(STOPGO_HAND_COPY.limited, { km: STOPGO_SETTINGS.limitMaxKm })}`}
      </p>
      <ul className={STOPGO_HAND.malus}>
        {hazards.length === 0 && <li>{STOPGO_HAND_COPY.noHazard}</li>}
        {hazards.map((hazard) => {
          const fix = STOPGO_CARD_COPY[remedyOf(hazard) as StopGoCardKey].name

          return (
            <li key={hazard} title={fillPlayMessage(STOPGO_HAND_COPY.fixedBy, { card: fix })}>
              <span className="size-5">
                <StopGoCardGlyph name={hazard} />
              </span>
              {STOPGO_CARD_COPY[hazard].name}
            </li>
          )
        })}
      </ul>
      <ul className={STOPGO_HAND.jokers} aria-label={STOPGO_HAND_COPY.jokers}>
        {Object.values(StopGoJokers).map((joker) => {
          const isReady = !!player.jokers[joker]
          const label =
            joker === StopGoJokers.Immunity ? STOPGO_HAND_COPY.immunity : STOPGO_HAND_COPY.cleanup

          return (
            <li key={joker} className={cn(STOPGO_HAND.joker, !isReady && STOPGO_HAND.jokerSpent)}>
              {isMe && joker === StopGoJokers.Cleanup && canCleanup ? (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={onCleanup}
                  title={STOPGO_HAND_COPY.cleanupHint}
                >
                  {label}
                </button>
              ) : (
                <span>{label}</span>
              )}
              <small>{isReady ? STOPGO_HAND_COPY.jokerReady : STOPGO_HAND_COPY.jokerSpent}</small>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
