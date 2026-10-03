'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Section } from '@/components/structures/Section'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import {
  LIVE_REPORT_COPY,
  MEMBER_MODERATION_COPY,
  MODERATION_KINDS,
} from '@/declarations/lives/moderation'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_REPORT, MEMBER_MODERATION } from '@/declarations/ui/variants'
import type { MemberModerationView as View } from '@/types/lives'
import { formatDay } from '@/utils/format/dates'
import { formatClock, formatDuration, formatSpan } from '@/utils/format/modview'

export interface MemberModerationViewProps {
  view: View | null
  // Viewer may open a live's report
  canOpenReports: boolean
}

/**
 * Moderation of one member: time spent, then live by live, the detail on click
 * @param {View | null} view - History, none while unavailable
 * @param {boolean} canOpenReports - Report links shown
 * @return {JSX.Element}
 */

export const MemberModerationView = ({ view, canOpenReports }: MemberModerationViewProps) => {
  const [open, setOpen] = useState<string | null>(null)

  if (!view) return <p className={LIVE_REPORT.notice}>{MEMBER_MODERATION_COPY.unavailable}</p>

  return (
    <div className={MEMBER_MODERATION.stack}>
      <p className={MEMBER_MODERATION.hours}>
        <span className={MEMBER_MODERATION.hoursLabel}>
          {MEMBER_MODERATION_COPY.hours.replace('{days}', String(LIVE_SETTINGS.hoursWindowDays))}
        </span>
        <span className={MEMBER_MODERATION.hoursValue}>{formatSpan(view.windowSeconds)}</span>
      </p>

      <Section title={MEMBER_MODERATION_COPY.livesTitle} padded>
        {view.lives.length === 0 ? (
          <p className={LIVE_REPORT.empty}>{MEMBER_MODERATION_COPY.empty}</p>
        ) : (
          <ul className={MEMBER_MODERATION.list}>
            {view.lives.map((live) => {
              const platform = LIVE_PLATFORM_REGISTRY.get(live.platform)
              const PlatformIcon = ICONS[platform.icon]
              const isOpen = open === live.liveId
              const summary = live.kinds.length
                ? live.kinds
                    .map(
                      (entry) =>
                        `${entry.count} ${MODERATION_KINDS[entry.kind].label.toLowerCase()}`
                    )
                    .join(', ')
                : MEMBER_MODERATION_COPY.noGesture

              return (
                <li key={live.liveId} className={MEMBER_MODERATION.item}>
                  <button
                    type="button"
                    className={MEMBER_MODERATION.row}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : live.liveId)}
                  >
                    <PlatformIcon className={MEMBER_MODERATION.rowIcon} aria-hidden="true" />
                    <span className={MEMBER_MODERATION.rowMain}>
                      <span className={MEMBER_MODERATION.rowTitle}>
                        {`${live.creator} · ${formatDay(live.startedAt)}`}
                      </span>
                      <span className={MEMBER_MODERATION.rowMeta}>{summary}</span>
                    </span>
                    <span className={MEMBER_MODERATION.rowTime}>
                      {MEMBER_MODERATION_COPY.activeTime.replace(
                        '{time}',
                        formatSpan(live.activeSeconds)
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className={MEMBER_MODERATION.details}>
                      {live.lines.length === 0 ? (
                        <p className={LIVE_REPORT.empty}>{MEMBER_MODERATION_COPY.noGesture}</p>
                      ) : (
                        <ol className={LIVE_REPORT.log}>
                          {live.lines.map((line) => {
                            const meta = MODERATION_KINDS[line.kind]
                            const Icon = ICONS[meta.icon]
                            const details = [
                              line.targetLogin,
                              line.durationSeconds ? formatDuration(line.durationSeconds) : null,
                              line.reason,
                            ].filter(Boolean)

                            return (
                              <li key={line.id} className={LIVE_REPORT.line}>
                                <time className={LIVE_REPORT.lineTime}>
                                  {formatClock(line.occurredAt)}
                                </time>
                                <span className={LIVE_REPORT.lineWhat}>
                                  <Icon className={LIVE_REPORT.lineIcon} aria-hidden="true" />
                                  {meta.label}
                                  {line.status === 'FAILED' && (
                                    <span className={LIVE_REPORT.lineFailed}>
                                      {LIVE_REPORT_COPY.refused}
                                    </span>
                                  )}
                                </span>
                                <span className={LIVE_REPORT.lineDetail}>
                                  {details.join(' · ')}
                                </span>
                              </li>
                            )
                          })}
                        </ol>
                      )}
                      {canOpenReports && (
                        <Link
                          href={ROUTES.liveReport(live.liveId)}
                          className={MEMBER_MODERATION.detailsLink}
                        >
                          {MEMBER_MODERATION_COPY.report}
                        </Link>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </div>
  )
}
