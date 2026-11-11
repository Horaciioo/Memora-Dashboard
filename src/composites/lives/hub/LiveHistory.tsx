'use client'

import { useEffect, useRef, useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import AppLink from '@/components/elements/navigation/AppLink'
import { InlineText } from '@/components/structures/inline/InlineText'
import { LiveRemovalDialog, RemovableLive } from '@/composites/lives/RemovableLive'
import { useLiveData } from '@/core/hooks/data/lives/useLiveData'
import { useLiveRemoval } from '@/core/hooks/data/lives/useLiveRemoval'
import { historyFiguresOf } from '@/core/lib/lives/hub'
import { LIVE_HISTORY_LIMIT, LIVE_HUB_COPY, LIVE_HUB_METRICS } from '@/declarations/lives/hub'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES, LIVE_HUB_STYLES } from '@/declarations/ui/variants'
import type { LiveView, MemberLiveSummary } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/time/dates'
import { roughDuration } from '@/utils/format/time/hours'

export interface LiveHistoryProps {
  past: LiveView[]
  moderated: MemberLiveSummary[]
  canReport: boolean
  canCreatorReport: boolean
  canDelete: boolean
}

/**
 * Finished lives of a creator, newest first, with the member's figures
 * @param {LiveHistoryProps} props - Past lives and the ones the member moderated
 * @return {JSX.Element}
 */

export const LiveHistory = ({
  past,
  moderated,
  canReport,
  canCreatorReport,
  canDelete,
}: LiveHistoryProps) => {
  const listRef = useRef<HTMLUListElement>(null)
  const [isShown, setIsShown] = useState(false)
  const removal = useLiveRemoval()
  const data = useLiveData()
  const summaries = new Map(moderated.map((live) => [live.liveId, live]))
  const known = new Set(past.map((live) => live.id))

  // Past lives first, then the moderated ones the list does not hold
  const entries = [
    ...past.map((live) => ({
      id: live.id,
      title: live.title,
      day: live.startedAt ?? live.plannedStartAt,
      name: live.youtuber.name,
      avatar: live.youtuber.avatar,
      canRename: canDelete,
    })),
    ...moderated
      .filter((live) => !known.has(live.liveId))
      .map((live) => ({
        id: live.liveId,
        title: live.title,
        day: live.startedAt,
        name: live.creator,
        avatar: live.creatorAvatar,
        canRename: false,
      })),
  ]
    .sort((a, b) => Date.parse(b.day) - Date.parse(a.day))
    .slice(0, LIVE_HISTORY_LIMIT)

  // Timeline draws itself once it scrolls into view
  useEffect(() => {
    const node = listRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setIsShown(true)
        observer.disconnect()
      },
      { threshold: 0.15 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [entries.length])

  return (
    <section className={LIVE_HUB_STYLES.history}>
      <h2 className={LIVE_HUB_STYLES.historyTitle}>{LIVE_HUB_COPY.historyTitle}</h2>
      {entries.length === 0 ? (
        <p className={LIVE_HUB_STYLES.empty}>{LIVE_HUB_COPY.historyEmpty}</p>
      ) : (
        <ul
          ref={listRef}
          data-shown={isShown ? '' : undefined}
          className={LIVE_HUB_STYLES.timeline}
        >
          {entries.map((entry) => {
            const summary = summaries.get(entry.id)
            const figures = historyFiguresOf(summary ? [summary] : [])
            const day = formatDay(entry.day)
            const title = entry.canRename ? (
              <InlineText
                id={`title-${entry.id}`}
                value={entry.title}
                placeholder={LIVE_REPORT_COPY.titlePlaceholder}
                onCommit={(next) => data.rename(entry.id, next)}
              />
            ) : (
              entry.title
            )

            const footer = (
              <>
                <dl className={LIVE_HUB_STYLES.timelineChips}>
                  {(Object.keys(LIVE_HUB_METRICS) as (keyof typeof LIVE_HUB_METRICS)[]).map(
                    (key) => {
                      const metric = LIVE_HUB_METRICS[key]
                      const Icon = ICONS[metric.icon]

                      return (
                        <div key={key} className={LIVE_HUB_STYLES.timelineChip}>
                          <Icon className={LIVE_HUB_STYLES.metricIcon} aria-hidden="true" />
                          <dd className={LIVE_HUB_STYLES.timelineValue}>
                            {key === 'time' && figures[key] > 0
                              ? roughDuration(figures[key] / 60)
                              : String(figures[key])}
                          </dd>
                          <dt className={LIVE_HUB_STYLES.timelineLabel}>{metric.label}</dt>
                        </div>
                      )
                    }
                  )}
                </dl>
                {(canReport || canCreatorReport) && <hr className={LIVE_HUB_STYLES.divider} />}
                {(canReport || canCreatorReport) && (
                  <div className={LIVE_HUB_STYLES.timelineLinks}>
                    {canReport && (
                      <AppLink
                        href={ROUTES.liveReport(entry.id)}
                        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.secondary, 'flex-1')}
                      >
                        {LIVE_REPORT_COPY.open}
                      </AppLink>
                    )}
                    {canCreatorReport && (
                      <AppLink
                        href={ROUTES.liveCreatorReport(entry.id)}
                        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.secondary, 'flex-1')}
                      >
                        {LIVE_REPORT_COPY.openCreator}
                      </AppLink>
                    )}
                  </div>
                )}
              </>
            )

            return (
              <RemovableLive
                key={entry.id}
                liveId={entry.id}
                removal={removal}
                enabled={canDelete}
                className={LIVE_HUB_STYLES.timelineItem}
              >
                <>
                  <span className={LIVE_HUB_STYLES.timelineDot} aria-hidden="true" />
                  <p className={LIVE_HUB_STYLES.timelineDay}>{day}</p>
                  <div className={LIVE_HUB_STYLES.timelineCard}>
                    <div className={LIVE_HUB_STYLES.timelineHead}>
                      <Avatar name={entry.name} src={entry.avatar} size="lg" />
                      <span className={LIVE_HUB_STYLES.rowBody}>
                        <span className={LIVE_HUB_STYLES.rowTitle}>{title}</span>
                      </span>
                    </div>
                    {footer}
                  </div>
                </>
              </RemovableLive>
            )
          })}
        </ul>
      )}
      <LiveRemovalDialog removal={removal} />
    </section>
  )
}
