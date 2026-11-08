import { GolfScorecard } from '@/composites/play/golf/hud/results/GolfScorecard'
import type { GolfScorecardProps } from '@/composites/play/golf/hud/results/GolfScorecard'
import { PlayPodium } from '@/composites/play/results/PlayPodium'
import { PlayStageKeys } from '@/composites/play/session/PlayStageKeys'
import { usePlayStageStore } from '@/core/store/playStage'
import { rankCards } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { BOMB_BOARD, GOLF_SCORECARD } from '@/declarations/ui/variants'
import { PLAY_GAMES } from '@/declarations/play'
import { PlayGames } from '@/utils/constants/play'

/**
 * End of the course: fewest strokes on the podium, the full scorecard below, full screen key kept
 * @param {GolfScorecardProps} props - Cards
 * @return {JSX.Element}
 */

export const GolfResult = ({
  sessionId,
  isSeated,
  ...props
}: GolfScorecardProps & { sessionId: string; isSeated: boolean }) => {
  const isFullscreen = usePlayStageStore((state) => state.isFullscreen)
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
      {/* The course keys are gone with the HUD */}
      {isFullscreen && (
        <PlayStageKeys
          game={PlayGames.Golf}
          sessionId={sessionId}
          gameSlug={PLAY_GAMES.get(PlayGames.Golf).slug}
          isSeated={isSeated}
        />
      )}
      <PlayPodium ranked={ranked} hasWinner={props.players.some((player) => !player.hasLeft)} />
      <section className={GOLF_SCORECARD.card}>
        <h2 className={GOLF_SCORECARD.title}>{GOLF_BOARD_COPY.scorecard}</h2>
        <GolfScorecard {...props} />
      </section>
    </div>
  )
}
