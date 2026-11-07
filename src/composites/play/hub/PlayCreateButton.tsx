'use client'

import { Button } from '@/components/elements/actions/Button'
import { Tip } from '@/components/elements/feedback/Tip'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayCreateButtonProps {
  game: PlayGameName
  // Busy, banned or not shipped
  disabled: boolean
  // Said on hover while locked
  lockedReason?: string | null
  className?: string
  // Words of the button, create by default
  label?: string
}

/**
 * Open a table of this game
 * @param {PlayCreateButtonProps} props - Game
 * @return {JSX.Element}
 */

export const PlayCreateButton = ({
  game,
  disabled,
  lockedReason,
  className,
  label = PLAY_HUB_COPY.create,
}: PlayCreateButtonProps) => {
  const moves = usePlayMoves()

  // Default rules, the lobby lets the host tune them
  const button = (
    <Button
      variant="arcade"
      className={className}
      disabled={disabled}
      isLoading={moves.isSaving}
      onClick={() => void moves.create(game)}
    >
      {label}
    </Button>
  )

  return (
    <>
      {disabled && lockedReason ? (
        <Tip label={lockedReason} className={PLAY_HUB.tipBlock}>
          {button}
        </Tip>
      ) : (
        button
      )}
    </>
  )
}
