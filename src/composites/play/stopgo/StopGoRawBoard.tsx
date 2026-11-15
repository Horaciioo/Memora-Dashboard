'use client'

export interface StopGoRawBoardProps {
  board: unknown
}

/**
 * Raw board of a race, a stand-in until the track is drawn
 * @param {StopGoRawBoardProps} props - Board as the server sent it
 * @return {JSX.Element}
 */

export const StopGoRawBoard = ({ board }: StopGoRawBoardProps) => (
  <pre className="size-full overflow-auto p-6 pt-24 text-xs text-[var(--play-ink)]">
    {JSON.stringify(board, null, 2)}
  </pre>
)
