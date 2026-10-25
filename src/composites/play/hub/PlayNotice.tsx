'use client'

import { MaturityTag } from '@/components/elements/display/MaturityTag'
import Link from '@/components/elements/navigation/AppLink'
import { usePlayNotice } from '@/core/hooks/interaction/layout/usePlayNotice'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_NOTICE } from '@/declarations/ui/variants'

/**
 * Bubble hung under the Play shortcut
 * @param {Object} props - Bubble
 * @param {number} props.pointedAt - Share of the shortcut row, 0 to 1
 * @return {JSX.Element | null}
 */

export const PlayNotice = ({ pointedAt }: { pointedAt: number }) => {
  const [isDismissed, dismiss] = usePlayNotice()
  if (isDismissed) return null

  const CloseIcon = ICONS.playClose

  return (
    <div className={PLAY_NOTICE.wrap}>
      <span
        className={PLAY_NOTICE.caret}
        style={{ left: `calc(${pointedAt * 100}% - 0.375rem)` }}
        aria-hidden="true"
      />
      <Link href={ROUTES.play} onClick={dismiss} className={PLAY_NOTICE.bubble}>
        <span className={PLAY_NOTICE.titleRow}>
          <span className={PLAY_NOTICE.title}>{PLAY_HUB_COPY.noticeTitle}</span>
          <MaturityTag maturity="alpha" interactive={false} compact />
        </span>
        <span className={PLAY_NOTICE.lead}>{PLAY_HUB_COPY.noticeLead}</span>
      </Link>
      <button
        type="button"
        aria-label={PLAY_HUB_COPY.noticeDismiss}
        title={PLAY_HUB_COPY.noticeDismiss}
        className={PLAY_NOTICE.dismiss}
        onClick={dismiss}
      >
        <CloseIcon className={PLAY_NOTICE.dismissIcon} aria-hidden="true" />
      </button>
    </div>
  )
}
