import type { CSSProperties } from 'react'

import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { levelShare } from '@/core/lib/play'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * One row per game: level, progress, played and coloured record, most XP first
 * @param {Object} props - Games
 * @param {PlayProfileView['games']} props.games - Per game totals
 * @return {JSX.Element}
 */

export const PlayMastery = ({ games }: { games: PlayProfileView['games'] }) => (
  <div className={PLAY_CAREER.mastery}>
    {games
      .filter((entry) => PLAY_GAMES.has(entry.game) && PLAY_GAMES.get(entry.game).playable)
      .sort((left, right) => right.xp - left.xp)
      .map((entry) => (
        <div
          key={entry.game}
          className={cn(PLAY_CAREER.row, entry.played === 0 && PLAY_CAREER.rowOff)}
          style={{ '--game': `var(${PLAY_GAMES.get(entry.game).tone})` } as CSSProperties}
        >
          <PlayGameLogo game={entry.game} className={PLAY_CAREER.rowLogo} />
          <div className={PLAY_CAREER.rowBody}>
            <div className={PLAY_CAREER.rowHead}>
              <span className={PLAY_CAREER.rowName}>{PLAY_GAMES.label(entry.game)}</span>
              <span className={PLAY_CAREER.rowLevel}>
                {fillPlayMessage(PLAY_HUB_COPY.level, { level: entry.level.level })}
              </span>
            </div>
            <span className={PLAY_CAREER.rowTrack}>
              <span
                className={PLAY_CAREER.rowFill}
                style={{ width: `${levelShare(entry.level)}%` }}
              />
            </span>
            <span className={PLAY_CAREER.rowNote}>
              <span>
                {entry.played === 0
                  ? PLAY_HUB_COPY.neverPlayed
                  : fillPlayMessage(PLAY_HUB_COPY.playedCount, { count: entry.played })}
              </span>
              {entry.played > 0 && (
                <span className={PLAY_CAREER.rowRecord}>
                  <span className={PLAY_CAREER.toneWin}>{entry.wins}</span>
                  <span className={PLAY_CAREER.toneDraw}>{entry.draws}</span>
                  <span className={PLAY_CAREER.toneLoss}>{entry.losses}</span>
                </span>
              )}
            </span>
          </div>
        </div>
      ))}
  </div>
)
