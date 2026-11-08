'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { cleanJoinCode } from '@/core/lib/play/joinCode'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_INVITE } from '@/declarations/ui/variants'

/**
 * Button opening a code field to enter a private game
 * @param {Object} props - Style
 * @param {string} [props.className] - Button style
 * @return {JSX.Element}
 */

export const PlayJoinCode = ({ className }: { className?: string }) => {
  const moves = usePlayMoves()
  const [isOpen, setOpen] = useState(false)
  const [code, setCode] = useState('')

  if (!isOpen) {
    return (
      <Button variant="arcade" className={className} onClick={() => setOpen(true)}>
        {PLAY_HUB_COPY.joinWithCode}
      </Button>
    )
  }

  return (
    <form
      className={PLAY_INVITE.entry}
      onSubmit={(event) => {
        event.preventDefault()
        void moves.joinCode(cleanJoinCode(code))
      }}
    >
      <input
        autoFocus
        value={code}
        placeholder={PLAY_HUB_COPY.codePlaceholder}
        aria-label={PLAY_HUB_COPY.codePlaceholder}
        className={PLAY_INVITE.entryInput}
        onChange={(event) => setCode(event.target.value)}
      />
      <Button
        type="submit"
        variant="arcade"
        className={className}
        disabled={cleanJoinCode(code) === ''}
        isLoading={moves.isSaving}
      >
        {PLAY_HUB_COPY.codeJoin}
      </Button>
      <Button variant="arcadeGhost" className={className} onClick={() => setOpen(false)}>
        {PLAY_HUB_COPY.codeBack}
      </Button>
    </form>
  )
}
