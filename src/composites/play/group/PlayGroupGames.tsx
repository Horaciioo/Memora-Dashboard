'use client'

import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { fillPlayMessage, PLAY_GAMES, PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_GROUP } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'

/**
 * Every game as a banner box, the host opens a table for the group with one tap
 * @param {Object} props - Group
 * @param {PlayGroupView} props.group - Group
 * @param {() => void} [props.onLaunched] - After the table is posted
 * @return {JSX.Element}
 */

export const PlayGroupGames = ({
  group,
  onLaunched,
}: {
  group: PlayGroupView
  onLaunched?: () => void
}) => {
  const actions = usePlayGroup()
  const games = PLAY_GAMES.keys.filter((game) => PLAY_GAMES.get(game).playable)

  return (
    <ul className={PLAY_GROUP.gameRow}>
      {games.map((game) => (
        <li key={game}>
          <button
            type="button"
            className={PLAY_GROUP.gameBox}
            disabled={actions.isSaving}
            onClick={() =>
              void actions.launch(group.id, game).then((isOk) => isOk && onLaunched?.())
            }
          >
            <PlayGameArt game={game} className={PLAY_GROUP.gameArt} />
            <span className={PLAY_GROUP.gameShade} aria-hidden="true" />
            <span className={PLAY_GROUP.gameTitle}>{PLAY_GAMES.label(game)}</span>
            <span className={PLAY_GROUP.gamePlayers}>
              {fillPlayMessage(PLAY_GROUP_COPY.players, {
                min: PLAY_GAMES.get(game).minPlayers,
                max: PLAY_GAMES.get(game).maxPlayers,
              })}
            </span>
            <span className={PLAY_GROUP.gamePlay}>{PLAY_GROUP_COPY.playNow}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
