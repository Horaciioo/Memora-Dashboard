'use client'

import { useCallback, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { PlayGameActions } from '@/composites/play/mobile/PlayGameActions'
import type { PlayGameActionsProps } from '@/composites/play/mobile/PlayGameActions'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { PLAY_HUD_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION } from '@/declarations/ui/variants'

/**
 * Exit key opening the exits card: hub, all games, give up or end
 * @param {Omit<PlayGameActionsProps, 'itemClass' | 'iconClass'>} props - Session, seat and state
 * @return {JSX.Element}
 */

export const PlayMenuKey = (props: Omit<PlayGameActionsProps, 'itemClass' | 'iconClass'>) => {
  const [isOpen, setOpen] = useState(false)
  const MenuIcon = ICONS.playLeave
  const holderRef = useRef<HTMLDivElement>(null)
  const fold = useCallback(() => setOpen(false), [])
  useOutsideDismiss(isOpen, holderRef, fold)

  return (
    <div ref={holderRef} className={BAC_SESSION.keyHolder}>
      <Button
        variant="arcadeGhost"
        className={BAC_SESSION.keyButton}
        aria-label={PLAY_HUD_COPY.exit}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen)}
      >
        <MenuIcon className={BAC_SESSION.keysIcon} aria-hidden="true" />
      </Button>
      {isOpen && (
        <div className={BAC_SESSION.menuCard} role="menu" aria-label={PLAY_HUD_COPY.exit}>
          <PlayGameActions
            {...props}
            itemClass={BAC_SESSION.menuRow}
            iconClass={BAC_SESSION.exitIcon}
            onLeft={fold}
          />
        </div>
      )}
    </div>
  )
}
