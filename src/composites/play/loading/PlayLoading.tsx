'use client'

import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'
import { PLAY_LOADINGS } from '@/composites/play/loading/games'
import { usePlayLoadingGameStore } from '@/core/store/play/playLoadingGame'

/**
 * Entry of every loading: the game's own loading, the shared frame when it has none
 * @param {PlayLoadingProps} props - Placement and progress
 * @return {JSX.Element}
 */

export const PlayLoading = (props: PlayLoadingProps) => {
  const aimed = usePlayLoadingGameStore((state) => state.game)
  const game = props.game ?? aimed
  const own = game ? PLAY_LOADINGS[game] : undefined

  return own ? own({ ...props, game }) : <PlayLoadingScreen {...props} game={game} />
}
