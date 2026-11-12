import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'

// Games needed before a win rate means something
const MIN_PLAYED = 3

type Entry = PlayProfileView['games'][number]

/**
 * Favourite, best, most won and untried game
 * @param {Object} props - Per-game figures
 * @param {Entry[]} props.games - Own games
 * @return {JSX.Element | null}
 */

export const PlayCareerFacts = ({ games }: { games: Entry[] }) => {
  const playable = games.filter(({ game }) => PLAY_GAMES.get(game).playable)
  const played = playable.filter((entry) => entry.played > 0)
  const rate = ({ wins, played: count }: Entry) => wins / count
  const top = (list: Entry[], score: (entry: Entry) => number) =>
    [...list].sort((a, b) => score(b) - score(a))[0]
  const favorite = top(played, (entry) => entry.played)
  const best = top(
    played.filter((entry) => entry.played >= MIN_PLAYED),
    rate
  )
  const wins = top(
    played.filter((entry) => entry.wins > 0),
    (entry) => entry.wins
  )
  const fresh = playable.find((entry) => entry.played === 0)

  const facts = [
    favorite && {
      label: PLAY_HUB_COPY.factFavorite,
      game: favorite.game,
      hint: fillPlayMessage(PLAY_HUB_COPY.factPlayed, { count: favorite.played }),
    },
    best && {
      label: PLAY_HUB_COPY.factBest,
      game: best.game,
      hint: fillPlayMessage(PLAY_HUB_COPY.factWinRate, { rate: Math.round(rate(best) * 100) }),
    },
    wins && {
      label: PLAY_HUB_COPY.factWins,
      game: wins.game,
      hint: fillPlayMessage(PLAY_HUB_COPY.factWon, { count: wins.wins }),
    },
    fresh && {
      label: PLAY_HUB_COPY.factNew,
      game: fresh.game,
      hint: PLAY_HUB_COPY.factNewHint,
    },
  ].filter((fact) => !!fact)

  if (!facts.length) return null

  return (
    <dl className={PLAY_CAREER.heroFacts}>
      {facts.map(({ label, game, hint }) => (
        <div key={label} className={PLAY_CAREER.heroFact}>
          <PlayGameLogo game={game} className={PLAY_CAREER.heroFactLogo} />
          <span className={PLAY_CAREER.heroFactBody}>
            <dt className={PLAY_CAREER.heroFactLabel}>{label}</dt>
            <dd className={PLAY_CAREER.heroFactValue}>{PLAY_GAMES.label(game)}</dd>
            <dd className={PLAY_CAREER.heroFactHint}>{hint}</dd>
          </span>
        </div>
      ))}
    </dl>
  )
}
