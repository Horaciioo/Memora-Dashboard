import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { fillPlayMessage, PLAY_CARD_COPY, PLAY_GAMES } from '@/declarations/play'
import { PLAY_CARD } from '@/declarations/ui/variants'
import type { PlayCardView } from '@/types/play'

/**
 * Games the player plays most
 * @param {Object} props - Games
 * @param {PlayCardView['topGames']} props.games - Most played
 * @return {JSX.Element | null}
 */

export const PlayCardGames = ({ games }: { games: PlayCardView['topGames'] }) => {
  if (games.length === 0) return null

  return (
    <section className={PLAY_CARD.block} aria-label={PLAY_CARD_COPY.topGames}>
      <h3 className={PLAY_CARD.section}>{PLAY_CARD_COPY.topGames}</h3>
      <div className={PLAY_CARD.collection}>
        {games.map(({ game, played, level }) => (
          <div key={game} className={PLAY_CARD.collect}>
            <PlayGameArt game={game} className={PLAY_CARD.collectArt} />
            <span className={PLAY_CARD.collectShade} aria-hidden="true" />
            <span className={PLAY_CARD.collectName}>{PLAY_GAMES.label(game)}</span>
            <span className={PLAY_CARD.collectLevel}>
              {fillPlayMessage(PLAY_CARD_COPY.level, { level })}
            </span>
            <span className={PLAY_CARD.collectMeta}>
              {fillPlayMessage(PLAY_CARD_COPY.played2, { count: played })}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
