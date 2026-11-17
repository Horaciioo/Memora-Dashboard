'use client'

import { PlayGameBanner } from '@/composites/play/hub/desk/PlayGameBanner'
import { PlayGameTile } from '@/composites/play/hub/desk/PlayGameTile'
import { PlayNote } from '@/composites/play/hub/notices/PlayNote'
import { usePlayNote } from '@/core/hooks/interaction/state/play/usePlayNote'
import type { PlayHubGame } from '@/core/lib/play/hubGames'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_DESK } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayDeskStageProps {
  featured: PlayGameName[]
  rest: PlayHubGame[]
}

/**
 * Centre of the desktop hub: the featured games big, every other game below
 * @param {PlayDeskStageProps} props - Banner games and cards
 * @return {JSX.Element}
 */

export const PlayDeskStage = ({ featured, rest }: PlayDeskStageProps) => {
  const { note, show } = usePlayNote()
  const onLocked = () => show(PLAY_HUB_COPY.mysterySoon)

  return (
    <div className={PLAY_DESK.stage}>
      {featured.length > 0 && (
        <section className={PLAY_DESK.heroes} aria-label={PLAY_HUB_COPY.featureTitle}>
          {featured.map((game) => (
            <PlayGameBanner key={game} game={game} />
          ))}
        </section>
      )}
      <section aria-labelledby="play-all-games" className="flex flex-col gap-4">
        <h2 id="play-all-games" className={PLAY_DESK.cardsTitle}>
          {PLAY_HUB_COPY.allGames}
        </h2>
        <div className={PLAY_DESK.cards}>
          {rest.map((entry) => (
            <PlayGameTile key={entry.game} {...entry} onLocked={onLocked} />
          ))}
        </div>
      </section>
      <PlayNote text={note} />
    </div>
  )
}
