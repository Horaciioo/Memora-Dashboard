'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

import { dismissLevelNoticeAction } from '@/app/(dashboard)/play/actions'
import { Button } from '@/components/elements/actions/Button'
import { useFocusTrap } from '@/core/hooks/interaction/layout/overlay/useFocusTrap'
import { PLAY_LEVEL_NOTICE } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_HUB, PLAY_TROPHY_UI } from '@/declarations/ui/variants'
import type { LevelNotice } from '@/core/services/play'
import { cn } from '@/utils/classnames'
import { formatNumber } from '@/utils/format/numbers'

/**
 * Box telling the level ladder changed
 * @param {Object} props - Notice
 * @param {LevelNotice | null} props.notice - Standing to announce
 * @return {JSX.Element | null}
 */

export const PlayLevelNotice = ({ notice }: { notice: LevelNotice | null }) => {
  const [isOpen, setIsOpen] = useState(Boolean(notice))
  const close = () => {
    setIsOpen(false)
    void dismissLevelNoticeAction()
  }
  const trapRef = useFocusTrap(isOpen, close)
  if (!notice || !isOpen) return null

  const copy = PLAY_LEVEL_NOTICE
  const host = document.querySelector('[data-play-stage]') ?? document.body
  const LevelIcon = ICONS.playTrophy
  const figures = [
    { value: formatNumber(notice.levels), label: notice.levels > 1 ? copy.levels : copy.level },
    { value: formatNumber(notice.xp), label: copy.xp },
    { value: `×${notice.factor}`, label: copy.factor },
  ]

  return createPortal(
    <div className={cn(PLAY_HUB.sheet, 'z-[60]')}>
      <div className={PLAY_HUB.sheetScrim} />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        className={cn(PLAY_HUB.sheetWindow, PLAY_TROPHY_UI.window)}
      >
        <div className={PLAY_TROPHY_UI.banner} aria-hidden="true">
          <div className={PLAY_TROPHY_UI.art} />
          <div className={PLAY_TROPHY_UI.shade} />
          <span className={PLAY_TROPHY_UI.medal}>
            <LevelIcon className={PLAY_TROPHY_UI.medalIcon} />
          </span>
        </div>
        <div className={PLAY_TROPHY_UI.body}>
          <h2 className={PLAY_TROPHY_UI.title}>{copy.title}</h2>
          <p className={PLAY_TROPHY_UI.text}>{copy.text}</p>
          <div className={PLAY_TROPHY_UI.figures}>
            {figures.map(({ value, label }) => (
              <div key={label} className={PLAY_TROPHY_UI.figure}>
                <span className={PLAY_TROPHY_UI.value}>{value}</span>
                <span className={PLAY_TROPHY_UI.label}>{label}</span>
              </div>
            ))}
          </div>
          <Button variant="arcade" className={PLAY_TROPHY_UI.key} onClick={close}>
            {copy.confirm}
          </Button>
        </div>
      </div>
    </div>,
    host
  )
}
