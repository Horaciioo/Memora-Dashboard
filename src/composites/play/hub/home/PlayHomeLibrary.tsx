'use client'

import { PlayJoinCode } from '@/composites/play/hub/lobby/PlayJoinCode'
import { PlayGameTile } from '@/composites/play/hub/home/PlayGameTile'
import { PlayNote } from '@/composites/play/hub/notices/PlayNote'
import { usePlayNote } from '@/core/hooks/interaction/state/play/usePlayNote'
import type { PlayHubGame } from '@/core/lib/play/hubGames'
import { PLAY_HOME_COPY, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HOME } from '@/declarations/ui/variants'
import type { PlayPerson } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Every game as a tile, an upcoming one kept secret
 * @param {Object} props - Library
 * @param {PlayHubGame[]} props.games - Games below the banners
 * @param {Partial<Record<PlayGameName, PlayPerson[]>>} props.faces - Players at each game
 * @param {boolean} props.isBanned - Locked out of Play
 * @return {JSX.Element}
 */

export const PlayHomeLibrary = ({
  games,
  faces,
  isBanned,
}: {
  games: PlayHubGame[]
  faces: Partial<Record<PlayGameName, PlayPerson[]>>
  isBanned: boolean
}) => {
  const { note, show } = usePlayNote()

  return (
    <section className={PLAY_HOME.section} aria-labelledby="play-library">
      <div className={PLAY_HOME.sectionHead}>
        <h2 id="play-library" className={PLAY_HOME.sectionTitle}>
          {PLAY_HOME_COPY.library}
        </h2>
        {!isBanned && <PlayJoinCode className={PLAY_HOME.tool} />}
      </div>
      <div className={PLAY_HOME.tiles}>
        {games.map((entry) => (
          <PlayGameTile
            key={entry.game}
            {...entry}
            faces={faces[entry.game] ?? []}
            onLocked={() => show(PLAY_HUB_COPY.mysterySoon)}
          />
        ))}
      </div>
      <PlayNote text={note} />
    </section>
  )
}
