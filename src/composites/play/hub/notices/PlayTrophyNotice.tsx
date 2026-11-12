'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

import { dismissTrophyNoticeAction } from '@/app/(dashboard)/play/actions'
import { Button } from '@/components/elements/actions/Button'
import { useFocusTrap } from '@/core/hooks/interaction/layout/overlay/useFocusTrap'
import { PLAY_TROPHY_NOTICE } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_HUB, PLAY_TROPHY_UI } from '@/declarations/ui/variants'
import type { TrophyNotice } from '@/core/services/play'
import { cn } from '@/utils/classnames'

// French digits grouping
const format = (value: number): string => value.toLocaleString('fr-FR')

/**
 * Box telling what the trophy change paid
 * @param {Object} props - Notice
 * @param {TrophyNotice | null} props.notice - Sum to announce
 * @return {JSX.Element | null}
 */

export const PlayTrophyNotice = ({ notice }: { notice: TrophyNotice | null }) => {
  const [isOpen, setIsOpen] = useState(Boolean(notice))
  const close = () => {
    setIsOpen(false)
    void dismissTrophyNoticeAction()
  }
  const trapRef = useFocusTrap(isOpen, close)
  if (!notice || !isOpen) return null

  const copy = PLAY_TROPHY_NOTICE
  const host = document.querySelector('[data-play-stage]') ?? document.body
  const TrophyIcon = ICONS.playTrophy
  const figures = [
    { value: notice.trophies, label: notice.trophies > 1 ? copy.trophies : copy.trophy },
    { value: notice.xp, label: copy.xp },
    { value: notice.levels, label: notice.levels > 1 ? copy.levels : copy.level },
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/play/scene/desktop.webp" alt="" className={PLAY_TROPHY_UI.art} />
          <div className={PLAY_TROPHY_UI.shade} />
          <span className={PLAY_TROPHY_UI.medal}>
            <TrophyIcon className={PLAY_TROPHY_UI.medalIcon} />
          </span>
        </div>
        <div className={PLAY_TROPHY_UI.body}>
          <h2 className={PLAY_TROPHY_UI.title}>{copy.title}</h2>
          <p className={PLAY_TROPHY_UI.text}>{copy.text}</p>
          <div className={PLAY_TROPHY_UI.figures}>
            {figures.map(({ value, label }) => (
              <div key={label} className={PLAY_TROPHY_UI.figure}>
                <span className={PLAY_TROPHY_UI.value}>{format(value)}</span>
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
