import { GolfScorecard } from '@/composites/play/golf/hud/GolfScorecard'
import type { GolfScorecardProps } from '@/composites/play/golf/hud/GolfScorecard'
import { PlayPodium } from '@/composites/play/results/PlayPodium'
import { rankCards } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { BOMB_BOARD, GOLF_SCORECARD } from '@/declarations/ui/variants'

/**
 * End of the course: fewest strokes on the podium, the full scorecard below
 * @param {GolfScorecardProps} props - Cards and pars
 * @return {JSX.Element}
 */

export const GolfResult = (props: GolfScorecardProps) => {
  const ranked = rankCards(props.players).map((player) => {
    const face = props.faces.find((entry) => entry.accountId === player.accountId)

    return {
      accountId: player.accountId,
      name: face?.name ?? '',
      avatarUrl: face?.avatarUrl ?? null,
      note: fillPlayMessage(GOLF_BOARD_COPY.strokesCount, { count: player.total }),
    }
  })

  return (
    <div className={BOMB_BOARD.result}>
      <PlayPodium ranked={ranked} hasWinner={props.players.some((player) => !player.hasLeft)} />
      <section className={GOLF_SCORECARD.card}>
        <h2 className={GOLF_SCORECARD.title}>{GOLF_BOARD_COPY.scorecard}</h2>
        <GolfScorecard {...props} />
      </section>
    </div>
  )
}
