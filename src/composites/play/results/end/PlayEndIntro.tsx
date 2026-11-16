import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { PLAY_END_COPY } from '@/declarations/play'
import { PLAY_END_PAGE } from '@/declarations/ui/variants'
import type { PlayEndReport } from '@/types/play'

/**
 * Announcement before the page builds: the title slams in, then the winner is named
 * @param {Object} props - Winner
 * @param {PlayEndReport['winner']} props.winner - First of the game, null when nobody won
 * @return {JSX.Element}
 */

export const PlayEndIntro = ({ winner }: { winner: PlayEndReport['winner'] }) => (
  <div className={PLAY_END_PAGE.intro} aria-hidden="true">
    <span className={PLAY_END_PAGE.introTitle}>{PLAY_END_COPY.over}</span>
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
