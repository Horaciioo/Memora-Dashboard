'use client'

import { useRef, useState } from 'react'

import { LevelFrame } from '@/composites/play/skin/LevelFrame'
import { PlayMeMenu } from '@/composites/play/mobile/PlayMeMenu'
import { usePlayLevel } from '@/core/hooks/data/play/usePlayLevel'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { PLAY_ME_COPY } from '@/declarations/play'
import { PLAY_TABS } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Portrait in the middle of the tab bar, opening the member box
 * @return {JSX.Element | null}
 */

export const PlayMeButton = () => {
  const { session } = useAuthContext()
  const level = usePlayLevel()
  const [isOpen, setIsOpen] = useState(false)
  const boundary = useRef<HTMLDivElement>(null)
  useOutsideDismiss(isOpen, boundary, () => setIsOpen(false))

  if (!session) return null

  return (
    <div ref={boundary} className={PLAY_TABS.meHost}>
      <button
        type="button"
        aria-label={PLAY_ME_COPY.open}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className={PLAY_TABS.me}
      >
        <span className={PLAY_TABS.portrait}>
          <LevelFrame
            level={level ?? 0}
            name={session.displayName}
            src={session.avatarUrl}
            size="lg"
          />
        </span>
      </button>

      {isOpen && <PlayMeMenu onClose={() => setIsOpen(false)} />}
    </div>
  )
}
