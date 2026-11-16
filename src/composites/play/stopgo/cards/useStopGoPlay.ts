import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'

/**
 * Every move of a Stop & Go player, each one carrying the turn it was meant for
 * @param {string} sessionId - Race
 * @param {StopGoBoardView} board - Board as the reader gets it
 * @return {Object} - Moves and the saving flag
 */

export const useStopGoPlay = (sessionId: string, board: StopGoBoardView) => {
  const { act, isSaving } = usePlayAct(sessionId)
  const send = (body: Record<string, unknown>) => act({ turnNo: board.turnNo, ...body })

  return {
    isSaving,
    play: (cardId: string, targets: string[] = []) => send({ type: 'play', cardId, targets }),
    draw: () => send({ type: 'draw' }),
    discard: (cardId: string) => send({ type: 'discard', cardId }),
    pick: (cardId: string) => send({ type: 'pick', cardId }),
    counter: () => send({ type: 'counter' }),
    decline: () => send({ type: 'decline' }),
    reveal: () => send({ type: 'reveal' }),
  }
}

/**
 * Moves of a player
 * @typedef {ReturnType<typeof useStopGoPlay>} StopGoMoves
 */

export type StopGoMoves = ReturnType<typeof useStopGoPlay>
