import { PlayEndFinale } from '@/composites/play/results/end/PlayEndFinale'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { PLAY_END_COPY } from '@/declarations/play'
import { PLAY_END_PAGE } from '@/declarations/ui/variants'
import type { PlayEndReport } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Announcement before the page builds: the title slams in, then the winner is named
 * @param {Object} props - Game and winner
 * @param {PlayGameName} props.game - Game that ended
 * @param {PlayEndReport['winner']} props.winner - First of the game, null when nobody won
 * @return {JSX.Element}
 */

export const PlayEndIntro = ({
  game,
  winner,
}: {
  game: PlayGameName
  winner: PlayEndReport['winner']
}) => (
  <div className={PLAY_END_PAGE.intro} aria-hidden="true">
    <PlayEndFinale game={game} />
    {winner && (
      <div className={PLAY_END_PAGE.introWinner}>
        <PlayAvatar
          accountId={winner.accountId}
          name={winner.name}
          src={winner.avatarUrl}
          size="xl"
        />
        <span className={PLAY_END_PAGE.introName}>{winner.name}</span>
        <span className={PLAY_END_PAGE.introSub}>{PLAY_END_COPY.announce}</span>
      </div>
    )}
  </div>
)
