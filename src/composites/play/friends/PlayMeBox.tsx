'use client'

import { useRef, useState } from 'react'

import { PlayMeMenu } from '@/composites/play/mobile/PlayMeMenu'
import { LevelFrame } from '@/composites/play/skin/LevelFrame'
import { usePlayProfile } from '@/core/hooks/data/play/usePlayProfile'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { levelShare } from '@/core/lib/play'
import { fillPlayMessage, PLAY_CARD_COPY, PLAY_HOME_COPY } from '@/declarations/play'
import { PLAY_ME_BOX } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Own player box: framed portrait, level, XP and progress, opens the member menu
 * @return {JSX.Element | null}
 */

export const PlayMeBox = () => {
  const { session } = useAuthContext()
  const level = usePlayProfile()?.global.level
  const [isOpen, setOpen] = useState(false)
  const boundary = useRef<HTMLDivElement>(null)
  useOutsideDismiss(isOpen, boundary, () => setOpen(false))

  if (!session) return null

  const into = level?.into ?? 0
  const needed = level?.needed ?? null
  const ratio = levelShare({ into, needed }) / 100
  const xp = needed ? `${into} / ${needed} XP` : fillPlayMessage(PLAY_CARD_COPY.xp, { xp: into })

  return (
    <div ref={boundary} className={PLAY_ME_BOX.host}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={PLAY_HOME_COPY.account}
        className={PLAY_ME_BOX.root}
        onClick={() => setOpen((open) => !open)}
      >
        <LevelFrame
          level={level?.level ?? 0}
          name={session.displayName}
          src={session.avatarUrl}
          size="md"
        />
        <span className={PLAY_ME_BOX.text}>
          <span className={PLAY_ME_BOX.head}>
            <span className={PLAY_ME_BOX.name}>{session.displayName}</span>
            <span className={PLAY_ME_BOX.level}>
              {fillPlayMessage(PLAY_CARD_COPY.level, { level: level?.level ?? 0 })}
            </span>
          </span>
          <span className={PLAY_ME_BOX.track} aria-hidden="true">
            <span className={PLAY_ME_BOX.fill} style={{ width: `${Math.round(ratio * 100)}%` }} />
          </span>
          <span className={PLAY_ME_BOX.xp}>{xp}</span>
        </span>
      </button>
      {isOpen && (
        <PlayMeMenu isTop menuClassName={PLAY_ME_BOX.menu} onClose={() => setOpen(false)} />
      )}
    </div>
  )
}
