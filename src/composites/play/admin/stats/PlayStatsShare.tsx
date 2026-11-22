import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlayEmpty } from '@/composites/play/shared/PlayEmpty'
import type { PlayGameShare } from '@/core/lib/play/adminStats'
import { fillPlayMessage, PLAY_GAMES } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY as COPY } from '@/declarations/play/admin'
import { PLAY_HEALTH } from '@/declarations/ui/variants'
import { formatPercent } from '@/utils/format/numbers'

/**
 * One bar cut per game, then a line each
 * @param {Object} props - Share of each game
 * @param {PlayGameShare[]} props.rows - Games, most played first
 * @return {JSX.Element}
 */

export const PlayStatsShare = ({ rows }: { rows: PlayGameShare[] }) => (
  <PlayPageTitle
    heading="h2"
    body={
      rows.length === 0 ? (
        <PlayEmpty isCompact>{COPY.statsEmpty}</PlayEmpty>
      ) : (
        <>
          <div className={PLAY_HEALTH.share} role="img" aria-label={COPY.statsShare}>
            {rows.map((row) => (
              <span
                key={row.game}
                className={PLAY_HEALTH.shareCut}
                style={{
                  width: `${row.part * 100}%`,
                  background: `var(${PLAY_GAMES.get(row.game).tone})`,
                }}
              />
            ))}
          </div>
          <ul className={PLAY_HEALTH.legend}>
            {rows.map((row) => (
              <li key={row.game} className={PLAY_HEALTH.legendRow}>
                <PlayGameLogo game={row.game} className={PLAY_HEALTH.legendLogo} />
                <span className={PLAY_HEALTH.legendText}>
                  <span className={PLAY_HEALTH.legendName}>{PLAY_GAMES.label(row.game)}</span>
                  <span className={PLAY_HEALTH.legendNote}>
                    {fillPlayMessage(COPY.statsSharePlayed, { count: row.count })}
                  </span>
                </span>
                <span className={PLAY_HEALTH.legendShare}>{formatPercent(row.part)}</span>
              </li>
            ))}
          </ul>
        </>
      )
    }
  >
    {COPY.statsShare}
  </PlayPageTitle>
)
