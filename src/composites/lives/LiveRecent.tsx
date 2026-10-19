'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import AppLink from '@/components/elements/navigation/AppLink'
import { Button } from '@/components/elements/actions/Button'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { ROUTES } from '@/declarations/navigation'
import { BUTTON_STYLES, LIVE_RECENT } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { Permissions } from '@/utils/constants/permissions'
import { formatHourMark } from '@/utils/format/dates'

export interface LiveRecentProps {
  live: LiveView
  isSaving: boolean
  onReopen: () => void
}

/**
 * Live closed within the day: no way in, only a way back when it stopped too soon
 * @param {LiveView} live - Closed live
 * @param {boolean} isSaving - Mutation in flight
 * @param {() => void} onReopen - Put it back
 * @return {JSX.Element}
 */

export const LiveRecent = ({ live, isSaving, onReopen }: LiveRecentProps) => {
  // The bilan opens for whoever reads logs
  const canReport = live.permissions.includes(Permissions.LiveLogRead)

  return (
    <article className={LIVE_RECENT.root}>
      <Avatar name={live.youtuber.name} src={live.youtuber.avatar} size="md" />
      <div className={LIVE_RECENT.identity}>
        <h3 className={LIVE_RECENT.title}>{live.title}</h3>
        <p className={LIVE_RECENT.meta}>
          {live.endedAt
            ? LIVE_COPY.recentEndedAt.replace('{time}', formatHourMark(live.endedAt))
            : ''}
        </p>
        {live.canReopen && <p className={LIVE_RECENT.hint}>{LIVE_COPY.reopenHint}</p>}
      </div>
      {(live.canReopen || canReport) && (
        <div className={LIVE_RECENT.actions}>
          {canReport && (
            <AppLink
              href={ROUTES.liveReport(live.id)}
              className={cn(BUTTON_STYLES.base, BUTTON_STYLES.secondary)}
            >
              {LIVE_REPORT_COPY.open}
            </AppLink>
          )}
          {live.canReopen && (
            <Button variant="secondary" isLoading={isSaving} onClick={onReopen}>
              {LIVE_COPY.reopen}
            </Button>
          )}
        </div>
      )}
    </article>
  )
}
