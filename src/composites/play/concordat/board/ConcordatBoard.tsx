'use client'

import { ConcordatTable } from '@/composites/play/concordat/board/ConcordatTable'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { useConcordatGame } from '@/core/hooks/data/play/useConcordatGame'
import type { ConcordatBoard as ConcordatBoardView } from '@/core/lib/play/concordat'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_BOARD } from '@/declarations/ui/variants'

export interface ConcordatBoardProps {
  sessionId: string
  board: ConcordatBoardView | null
  faces: PlayFace[]
  isSeated: boolean
}

/**
 * Concordat screen
 * @param {ConcordatBoardProps} props - Game and readers
 * @return {JSX.Element}
 */

export const ConcordatBoard = ({ sessionId, board, faces, isSeated }: ConcordatBoardProps) => {
  const { client, version, act } = useConcordatGame(sessionId, board)

  if (!client) return <p className={CONCORDAT_BOARD.waiting}>{CONCORDAT_HUD_COPY.waiting}</p>

  return (
    <ConcordatTable
      sessionId={sessionId}
      client={client}
      version={version}
      act={act}
      faces={faces}
      isSeated={isSeated}
    />
  )
}
