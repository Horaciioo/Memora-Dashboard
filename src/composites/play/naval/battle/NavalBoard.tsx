'use client'

import { captainsOf } from '@/composites/play/naval/setup/captains'
import type { NavalFace } from '@/composites/play/naval/setup/captains'
import { NavalBattle } from '@/composites/play/naval/battle/NavalBattle'
import { NavalPlacement } from '@/composites/play/naval/setup/NavalPlacement'
import { useNavalBoard } from '@/core/hooks/data/play/useNavalBoard'
import type { NavalBoardView } from '@/core/lib/play/naval/state'
import { NavalPhases } from '@/utils/constants/play'

export interface NavalBoardProps {
  sessionId: string
  board: NavalBoardView
  faces: NavalFace[]
  viewerId: string
}

/**
 * Naval table: placement first, then the battle and its result
 * @param {NavalBoardProps} props - Board and table
 * @return {JSX.Element}
 */

export const NavalBoard = ({ sessionId, board: initial, faces, viewerId }: NavalBoardProps) => {
  const board = useNavalBoard(sessionId, initial)
  const captains = captainsOf(board, faces)
  const viewer = board.players.findIndex((player) => player.accountId === viewerId)

  return board.phase === NavalPhases.Placement ? (
    <NavalPlacement sessionId={sessionId} board={board} captains={captains} viewer={viewer} />
  ) : (
    <NavalBattle sessionId={sessionId} board={board} captains={captains} viewer={viewer} />
  )
}
