import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayLevelBar } from '@/composites/play/member/stats/PlayLevelBar'
import { levelShare } from '@/core/lib/play'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_DOCK } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'

/**
 * Level of each game out, its bar to the next one
 * @param {Object} props - Games
 * @param {PlayProfileView['games']} props.games - Per game totals
 * @return {JSX.Element}
 */

export const PlayDockStats = ({ games }: { games: PlayProfileView['games'] }) => (
  <div className={PLAY_DOCK.rows}>
    {games
      .filter((entry) => PLAY_GAMES.has(entry.game) && PLAY_GAMES.get(entry.game).playable)
      .map((entry) => (
        <div key={entry.game} className={PLAY_DOCK.row}>
          <span className={PLAY_DOCK.rowHead}>
            <span className={PLAY_DOCK.rowName}>
              <PlayGameLogo game={entry.game} className={PLAY_DOCK.rowLogo} />
              {PLAY_GAMES.label(entry.game)}
            </span>
            <span className={PLAY_DOCK.rowValue}>
              {fillPlayMessage(PLAY_HUB_COPY.level, { level: entry.level.level })}
            </span>
          </span>
          <PlayLevelBar share={levelShare(entry.level)} isThin />
        </div>
      ))}
  </div>
)
