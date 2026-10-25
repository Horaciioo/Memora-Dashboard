'use client'

import { Button } from '@/components/elements/actions/Button'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlayGameGridProps {
  games: { game: PlayGameName; playable: boolean }[]
  // Busy players cannot open another table
  isLocked: boolean
}

/**
 * One card per game, opening a table
 * @param {PlayGameGridProps} props - Catalogue
 * @return {JSX.Element}
 */

export const PlayGameGrid = ({ games, isLocked }: PlayGameGridProps) => {
  const moves = usePlayMoves()

  return (
    <div className={PLAY_HUB.games}>
      {games.map(({ game, playable }) => {
        const meta = PLAY_GAMES.get(game)

        return (
          <article key={game} className={cn(PLAY_HUB.game, !playable && PLAY_HUB.gameOff)}>
            <span className={PLAY_HUB.gameMark} style={{ background: `var(${meta.tone})` }} />
            <div>
              <h3 className={PLAY_HUB.gameName}>{meta.label}</h3>
              <p className={PLAY_HUB.gameFacts}>
                {fillPlayMessage(PLAY_HUB_COPY.players, {
                  players: meta.minPlayers,
                  max: meta.maxPlayers,
                })}
              </p>
            </div>
            <Button
              disabled={!playable || isLocked}
              isLoading={moves.isSaving}
              onClick={() => void moves.create(game)}
            >
              {playable ? PLAY_HUB_COPY.create : PLAY_HUB_COPY.soon}
            </Button>
          </article>
        )
      })}
    </div>
  )
}
