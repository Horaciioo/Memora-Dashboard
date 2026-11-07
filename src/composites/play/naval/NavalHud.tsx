'use client'

import { NavalClock } from '@/composites/play/naval/NavalClock'
import { useNavalAudioStore } from '@/core/store/navalAudio'
import { ICONS } from '@/declarations/ui/icons'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_HUD } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'

/**
 * Top bar: mode, call of the turn, clock and sound keys
 * @param {Object} props - Bar
 * @param {string} props.mode - Mode name
 * @param {string} props.call - Sentence of the turn
 * @param {'mine' | 'danger' | 'calm'} props.tone - Colour of the call
 * @param {{ serverTime: number; endsAt: number; totalSeconds: number; alertSeconds: number } | null} props.clock - Clock, none when idle
 * @return {JSX.Element}
 */

export const NavalHud = ({
  mode,
  call,
  tone,
  clock,
}: {
  mode: string
  call: string
  tone: 'mine' | 'danger' | 'calm'
  clock: { serverTime: number; endsAt: number; totalSeconds: number; alertSeconds: number } | null
}) => {
  const { hasEffects, hasAmbience, toggleEffects, toggleAmbience } = useNavalAudioStore()
  const EffectsIcon = hasEffects ? ICONS.golfSound : ICONS.golfMute
  const AmbienceIcon = hasAmbience ? ICONS.playFlame : ICONS.golfMute

  return (
    <div className={NAVAL_HUD.bar}>
      <div className={NAVAL_HUD.lead}>
        <span className={NAVAL_HUD.mode}>{mode}</span>
        <span
          className={cn(
            NAVAL_HUD.call,
            tone === 'mine' && NAVAL_HUD.callMine,
            tone === 'danger' && NAVAL_HUD.callDanger
          )}
          aria-live="polite"
        >
          {call}
        </span>
        {clock && <NavalClock {...clock} />}
      </div>
      <div className={NAVAL_HUD.keys}>
        <button
          type="button"
          className={NAVAL_HUD.soundKey}
          aria-pressed={hasEffects}
          aria-label={NAVAL_BOARD_COPY.soundEffects}
          onClick={toggleEffects}
        >
          <EffectsIcon className={NAVAL_HUD.soundIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={NAVAL_HUD.soundKey}
          aria-pressed={hasAmbience}
          aria-label={NAVAL_BOARD_COPY.soundAmbience}
          onClick={toggleAmbience}
        >
          <AmbienceIcon className={NAVAL_HUD.soundIcon} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
