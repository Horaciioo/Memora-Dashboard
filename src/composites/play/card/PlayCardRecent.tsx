import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { fillPlayMessage, PLAY_CARD_COPY, PLAY_GAMES, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_CARD } from '@/declarations/ui/variants'
import type { PlayCardView } from '@/types/play'
import { formatSince } from '@/utils/format/time/dates'

// Colour of each outcome
const OUTCOME_STYLE = { WIN: PLAY_CARD.win, DRAW: PLAY_CARD.draw, LOSS: PLAY_CARD.loss } as const

/**
 * Last games of a player
 * @param {Object} props - Games
 * @param {PlayCardView['recent']} props.games - Finished games
 * @return {JSX.Element}
 */

export const PlayCardRecent = ({ games }: { games: PlayCardView['recent'] }) => (
  <section className={PLAY_CARD.recent} aria-label={PLAY_CARD_COPY.recent}>
    <h3 className={PLAY_CARD.section}>{PLAY_CARD_COPY.recent}</h3>
    {games.length === 0 && <p className={PLAY_CARD.empty}>{PLAY_CARD_COPY.recentEmpty}</p>}
    {games.map((game) => (
      <div key={game.sessionId} className={PLAY_CARD.game}>
        <PlayGameLogo game={game.game} className={PLAY_CARD.logo} />
        <span className={PLAY_CARD.gameText}>
          <span className={PLAY_CARD.gameName}>{PLAY_GAMES.label(game.game)}</span>
          <span className={PLAY_CARD.gameMeta}>
            {formatSince(game.finishedAt)}
            {game.rank !== null &&
              ` · ${fillPlayMessage(PLAY_CARD_COPY.rank, { rank: game.rank, players: game.players })}`}
          </span>
        </span>
        {game.outcome && (
          <span className={OUTCOME_STYLE[game.outcome]}>
            {PLAY_MOBILE_COPY[`outcome${game.outcome}`]}
          </span>
        )}
      </div>
    ))}
  </section>
)
