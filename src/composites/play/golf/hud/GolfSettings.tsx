'use client'

import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { useGolfPrefsStore } from '@/core/store/golfPrefs'
import type { GolfPrefs } from '@/core/store/golfPrefs'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_BOARD, GOLF_PANEL } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

// Display switches, in card order
const SWITCHES: { key: keyof GolfPrefs; label: string }[] = [
  { key: 'showPlayers', label: GOLF_BOARD_COPY.showPlayers },
  { key: 'hasTrails', label: GOLF_BOARD_COPY.trails },
  { key: 'hasMist', label: GOLF_BOARD_COPY.mist },
  { key: 'hasSpecks', label: GOLF_BOARD_COPY.specks },
  { key: 'isLight', label: GOLF_BOARD_COPY.light },
]

/**
 * Settings card: sound and display switches
 * @return {JSX.Element}
 */

export const GolfSettings = () => {
  const prefs = useGolfPrefsStore()

  return (
    <div className={GOLF_BOARD.settings} role="dialog" aria-label={GOLF_BOARD_COPY.settings}>
      <div className={GOLF_BOARD.soundRow}>
        <PlayVolume game={PlayGames.Golf} />
      </div>
      <div className={GOLF_BOARD.rule} role="separator" />
      {SWITCHES.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="switch"
          aria-checked={prefs[key]}
          className={GOLF_BOARD.setting}
          onClick={() => prefs.flip(key)}
        >
          {label}
          <span className={GOLF_PANEL.switch}>
            <span className={cn(GOLF_PANEL.switchSide, !prefs[key] && GOLF_PANEL.switchOff)}>
              {GOLF_BOARD_COPY.switchOff}
            </span>
            <span className={cn(GOLF_PANEL.switchSide, prefs[key] && GOLF_PANEL.switchOn)}>
              {GOLF_BOARD_COPY.switchOn}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
