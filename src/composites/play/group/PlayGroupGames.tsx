'use client'

import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { PLAY_GAMES } from '@/declarations/play'
import { PLAY_CREW, PLAY_GROUP } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'

/**
 * Tray of games above the composer, one tap opens a table for the group
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
    <ul className={PLAY_CREW.tray}>
      {games.map((game) => (
        <li key={game}>
          <button
            type="button"
            className={PLAY_CREW.chip}
            disabled={actions.isSaving}
            onClick={() =>
              void actions.launch(group.id, game).then((isOk) => isOk && onLaunched?.())
            }
          >
            <PlayGameArt game={game} className={PLAY_GROUP.gameArt} />
            <span className={PLAY_GROUP.gameShade} aria-hidden="true" />
            <span className={PLAY_GROUP.gameTitle}>{PLAY_GAMES.label(game)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
