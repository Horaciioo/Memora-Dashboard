'use client'

import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { PLAY_GAMES, PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_GROUP } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'

/**
 * Every game as a banner box, the host opens a table for the group with one tap
 * @param {Object} props - Group
 * @param {PlayGroupView} props.group - Group
 * @param {boolean} [props.isTitled] - Shows heading
 * @return {JSX.Element}
 */

export const PlayGroupGames = ({
  group,
  isTitled = true,
}: {
  group: PlayGroupView
  isTitled?: boolean
}) => {
  const actions = usePlayGroup()
  const games = PLAY_GAMES.keys.filter((game) => PLAY_GAMES.get(game).playable)

  return (
    <section className={PLAY_GROUP.section}>
      {isTitled && (
        <>
          <h2 className={PLAY_GROUP.heading}>{PLAY_GROUP_COPY.games}</h2>
          <p className={PLAY_GROUP.hint}>{PLAY_GROUP_COPY.gamesHint}</p>
        </>
      )}
      <ul className={isTitled ? PLAY_GROUP.gameList : PLAY_GROUP.list}>
        {games.map((game) => (
          <li key={game}>
            <button
              type="button"
              className={PLAY_GROUP.gameBox}
              disabled={actions.isSaving}
              onClick={() => void actions.launch(group.id, game)}
            >
              <PlayGameArt game={game} className={PLAY_GROUP.gameArt} />
              <span className={PLAY_GROUP.gameShade} aria-hidden="true" />
              <span className={PLAY_GROUP.gameTitle}>{PLAY_GAMES.label(game)}</span>
              <span className={PLAY_GROUP.gamePlay}>{PLAY_GROUP_COPY.playNow}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
