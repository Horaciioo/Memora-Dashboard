'use client'

import { PlayGameActions } from '@/composites/play/mobile/PlayGameActions'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { useGolfPrefsStore } from '@/core/store/play/golfPrefs'
import type { GolfPrefs } from '@/core/store/play/golfPrefs'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_BOARD, GOLF_PANEL } from '@/declarations/ui/variants'
import { PLAY_GAMES } from '@/declarations/play'
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
 * Settings card: sound, display switches and the game exits
 * @param {Object} props - Session
 * @param {string} props.sessionId - Session id
 * @param {boolean} props.isSeated - Viewer plays
 * @return {JSX.Element}
 */

export const GolfSettings = ({ sessionId, isSeated }: { sessionId: string; isSeated: boolean }) => {
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
      <div className="flex flex-col gap-1">
        <div className={GOLF_BOARD.rule} role="separator" />
        <PlayGameActions
          sessionId={sessionId}
          gameSlug={PLAY_GAMES.get(PlayGames.Golf).slug}
          isSeated={isSeated}
          hasSettings={false}
          itemClass={cn(GOLF_BOARD.setting, 'justify-start')}
          iconClass="size-5"
        />
      </div>
    </div>
  )
}
