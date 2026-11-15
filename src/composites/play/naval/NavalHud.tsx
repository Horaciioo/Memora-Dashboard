'use client'

import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { NavalClock } from '@/composites/play/naval/NavalClock'
import type { NavalCaptainView } from '@/composites/play/naval/setup/captains'
import { PlayHudKeys } from '@/composites/play/hud/PlayHudKeys'
import { usePlayPrefsStore } from '@/core/store/play/playPrefs'
import { NavalCodes } from '@/core/lib/play/naval/state'
import type { NavalBoardState } from '@/core/lib/play/naval/state'
import { NAVAL_HUD_COPY } from '@/declarations/play'
import { NAVAL_HUD } from '@/declarations/ui/variants/games/naval'
import { cn } from '@/utils/classnames'
import { PlayGames } from '@/utils/constants/play'

export interface NavalHudProps {
  sessionId: string
  board: NavalBoardState
  captains: NavalCaptainView[]
  viewer: number
  call: string
  tone: 'mine' | 'danger' | 'calm'
  clock: { serverTime: number; endsAt: number; totalSeconds: number; alertSeconds: number } | null
  // Actions of the phase, set in the bridge
  actions?: ReactNode
}

/**
 * Naval HUD: three quiet glass pills on the top edge, captains, call and clock, keys
 * @param {NavalHudProps} props - Board and turn
 * @return {JSX.Element}
 */

export const NavalHud = ({
  sessionId,
  board,
  captains,
  viewer,
  call,
  tone,
  clock,
  actions,
}: NavalHudProps) => {
  const isHidden = usePlayPrefsStore((state) => state.isHudHidden)
  const sunk = (seat: number) =>
    board.shots.filter((shot) => shot[2] === seat && shot[6] === NavalCodes.Sunk).length

  return (
    <div className={NAVAL_HUD.root} data-hud={PlayGames.Naval.toLowerCase()}>
      {!isHidden && (
        <ul className={NAVAL_HUD.crew} aria-label={NAVAL_HUD_COPY.crew}>
          {captains.map((captain) => (
            <li
              key={captain.accountId}
              className={cn(NAVAL_HUD.captain, captain.isOut && NAVAL_HUD.captainOut)}
              title={captain.name}
            >
              <span className={NAVAL_HUD.face}>
                <Avatar name={captain.name} src={captain.avatarUrl} size="xs" />
              </span>
              <span
                className={cn(NAVAL_HUD.sunk, captain.index === viewer && NAVAL_HUD.sunkMine)}
                title={NAVAL_HUD_COPY.sunk}
              >
                {sunk(captain.index)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className={NAVAL_HUD.bridge}>
        <span
          key={call}
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
        {actions && <div className={NAVAL_HUD.actions}>{actions}</div>}
      </div>
      <div className={NAVAL_HUD.keys}>
        <PlayHudKeys game={PlayGames.Naval} sessionId={sessionId} isSeated={viewer >= 0} />
      </div>
    </div>
  )
}
