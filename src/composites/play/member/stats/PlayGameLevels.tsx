import type { CSSProperties } from 'react'

import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayLevelBar } from '@/composites/play/member/stats/PlayLevelBar'
import { recordOf } from '@/composites/play/member/stats/PlayStatTiles'
import { levelShare } from '@/core/lib/play'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_STATS } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'

/**
 * Level of each game out, secret games left aside
 * @param {Object} props - Games
 * @param {PlayProfileView['games']} props.games - Per game totals
 * @return {JSX.Element}
 */

export const PlayGameLevels = ({ games }: { games: PlayProfileView['games'] }) => (
  <section className={PLAY_STATS.section}>
    <h2 className={PLAY_STATS.heading}>{PLAY_HUB_COPY.sectionGamesLevels}</h2>
    <div className={PLAY_STATS.games}>
      {games
        .filter((entry) => PLAY_GAMES.has(entry.game) && PLAY_GAMES.get(entry.game).playable)
        .map((entry) => (
          <div
            key={entry.game}
            className={PLAY_STATS.game}
            style={{ '--game': `var(${PLAY_GAMES.get(entry.game).tone})` } as CSSProperties}
          >
            <PlayGameLogo game={entry.game} className={PLAY_STATS.gameLogo} />
            <div className={PLAY_STATS.gameText}>
              <span className={PLAY_STATS.gameHead}>
                <span className={PLAY_STATS.gameName}>{PLAY_GAMES.label(entry.game)}</span>
                <span className={PLAY_STATS.gameLevel}>
                  {fillPlayMessage(PLAY_HUB_COPY.level, { level: entry.level.level })}
                </span>
              </span>
              <PlayLevelBar share={levelShare(entry.level)} isThin />
              <span className={PLAY_STATS.caption}>
                {fillPlayMessage(PLAY_HUB_COPY.xp, { xp: entry.xp })}
                {' - '}
                {recordOf(entry)}
              </span>
            </div>
          </div>
        ))}
    </div>
  </section>
)
