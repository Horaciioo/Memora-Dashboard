import { Button } from '@/components/elements/actions/Button'
import AppLink from '@/components/elements/navigation/AppLink'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { MODVIEW_PAGE } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'
import { formatDayTime } from '@/utils/format/dates'

export interface LiveClosedNoticeProps {
  live: LiveView
}

/**
 * Screen of a live that cannot be entered: too early, or over
 * @param {LiveView} live - Live
 * @return {JSX.Element}
 */

export const LiveClosedNotice = ({ live }: LiveClosedNoticeProps) => {
  const isEarly = live.access === 'early'

  return (
    <div className={MODVIEW_PAGE.closed}>
      <h2 className={MODVIEW_PAGE.closedTitle}>
        {isEarly ? LIVE_PAGE_COPY.earlyTitle : LIVE_PAGE_COPY.overTitle}
      </h2>
      <p className={MODVIEW_PAGE.closedBody}>
        {isEarly
          ? LIVE_PAGE_COPY.earlyBody.replace('{time}', formatDayTime(live.opensAt))
          : LIVE_PAGE_COPY.overBody}
      </p>
      <AppLink href={ROUTES.lives}>
        <Button variant="primary">{LIVE_PAGE_COPY.backToLives}</Button>
      </AppLink>
    </div>
  )
}
