'use client'

import { NavalClock } from '@/composites/play/naval/NavalClock'
import { NAVAL_HUD } from '@/declarations/ui/variants/games/naval'
import { cn } from '@/utils/classnames'

/**
 * Top bar: mode, call of the turn and clock
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
}) => (
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
  </div>
)
