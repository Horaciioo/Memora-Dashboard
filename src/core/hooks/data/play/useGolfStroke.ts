'use client'

import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { dropLocal, playLocal, simulateShot, strokeBalls } from '@/core/lib/play/golf'
import type { RefObject } from 'react'

import type { GolfBoardState, GolfHole, GolfMotion } from '@/core/lib/play/golf'

/**
 * Golf gestures: a stroke predicted at once then sent, a power played
 * @param {Object} input - Course
 * @param {string} input.sessionId - Game
 * @param {string} input.viewerId - Player
 * @param {GolfBoardState} input.board - Board
 * @param {GolfHole} input.hole - Hole
 * @param {RefObject<GolfMotion>} input.motionRef - Motion
 * @return {Object} - Gestures
 */

export const useGolfStroke = ({
  sessionId,
  viewerId,
  board,
  hole,
  motionRef,
}: {
  sessionId: string
  viewerId: string
  board: GolfBoardState
  hole: GolfHole
  motionRef: RefObject<GolfMotion>
}) => {
  const { act, isSaving } = usePlayAct(sessionId)
  const offset = board.serverTime - board.receivedAt

  return {
    isSaving,
    shoot: (angle: number, power: number) => {
      const at = Date.now() + offset
      const present = board.players.filter((player) => !player.hasLeft)
      // Same physics as the server, played straight away
      const result = simulateShot({
        hole,
        at,
        holeStart: board.startsAt,
        shooterId: viewerId,
        angle,
        power,
        balls: strokeBalls(present, viewerId, at, board.settings.powers.length > 0),
        hazards: board.hazards,
        orbs: board.orbs,
        collisions: board.settings.collisions,
      })
      playLocal(motionRef.current, result, at, viewerId)
      void act({ type: 'shot', angle, power }, { quiet: true }).then((isDone) => {
        if (!isDone) dropLocal(motionRef.current)
      })
    },
    power: (play: { slot: number; x?: number; z?: number; targetId?: string }) =>
      act({ type: 'power', ...play }, { quiet: true }),
  }
}
