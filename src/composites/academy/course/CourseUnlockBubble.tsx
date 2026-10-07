'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { GUIDE_KEYS } from '@/declarations/academy/welcome'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_UNLOCK } from '@/declarations/ui/variants'

export interface CourseUnlockBubbleProps {
  // Runs on the catalogue itself, otherwise the bubble leads there
  onOpen?: () => void
}

/**
 * Bubble beside the page announcing the specialisations that just opened
 * @param {CourseUnlockBubbleProps} props - Optional opener
 * @return {JSX.Element | null}
 */

export const CourseUnlockBubble = ({ onOpen }: CourseUnlockBubbleProps) => {
  const router = useRouter()
  const { run } = useMutation()
  const [isClosed, setClosed] = useState(false)
  const Glyph = ICONS.spark
  const CloseIcon = ICONS.close

  if (isClosed) return null

  // Seen once, wherever it is closed
  const dismiss = async (open: boolean) => {
    const saved = await run(() =>
      apiPost(API_ROUTES.seenGuide, { key: GUIDE_KEYS.specialisations })
    )
    if (!saved) return

    setClosed(true)
    if (!open) return
    if (onOpen) onOpen()
    else router.push(ROUTES.trainings)
  }

  return (
    <aside className={COURSE_UNLOCK.root} aria-label={COURSE_COPY.unlockTitle}>
      <div className={COURSE_UNLOCK.head}>
        <Glyph className={COURSE_UNLOCK.glyph} aria-hidden="true" />
        <h2 className={COURSE_UNLOCK.title}>{COURSE_COPY.unlockTitle}</h2>
        <button
          type="button"
          aria-label={COURSE_COPY.unlockClose}
          onClick={() => void dismiss(false)}
          className={COURSE_UNLOCK.close}
        >
          <CloseIcon className={COURSE_UNLOCK.closeIcon} aria-hidden="true" />
        </button>
      </div>
      <p className={COURSE_UNLOCK.text}>{COURSE_COPY.unlockBody}</p>
      <button type="button" onClick={() => void dismiss(true)} className={COURSE_UNLOCK.action}>
        {COURSE_COPY.unlockOpen}
      </button>
    </aside>
  )
}
