import { fillPlayMessage, PLAY_CARD_COPY } from '@/declarations/play'
import { PLAY_CARD } from '@/declarations/ui/variants'
import type { PlayCardView } from '@/types/play'

/**
 * Three figures in one group, wins carry the win rate
 * @param {Object} props - Stats
 * @param {PlayCardView} props.card - Player
 * @return {JSX.Element}
 */

export const PlayCardStats = ({ card }: { card: PlayCardView }) => {
  const figures = [
    { label: PLAY_CARD_COPY.played, value: card.played, note: '' },
    {
      label: PLAY_CARD_COPY.wins,
      value: card.wins,
      note: card.played
        ? fillPlayMessage(PLAY_CARD_COPY.winRate, { rate: Math.round(card.winRate * 100) })
        : '',
    },
    { label: PLAY_CARD_COPY.streak, value: card.bestStreak, note: '' },
  ]

  return (
    <dl className={PLAY_CARD.figures}>
      {figures.map(({ label, value, note }) => (
        <div key={label} className={PLAY_CARD.figure}>
          <dd className={PLAY_CARD.figureValue}>{value}</dd>
          <dt className={PLAY_CARD.figureLabel}>{label}</dt>
          {note && <span className={PLAY_CARD.figureNote}>{note}</span>}
        </div>
      ))}
    </dl>
  )
}
