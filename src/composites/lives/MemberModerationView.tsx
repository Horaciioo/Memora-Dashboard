'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { Dotted } from '@/components/elements/display/Dotted'
import Link from '@/components/elements/navigation/AppLink'
import { useState } from 'react'

import { Pagination } from '@/components/elements/navigation/Pagination'
import { Section } from '@/components/structures/page/Section'
import { ReinforcementTag } from '@/composites/lives/ReinforcementTag'
import { ModSpan } from '@/composites/lives/ModSpan'
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
import { formatClock, formatDuration, formatExactSpan, formatSpan } from '@/utils/format/modview'

// Words around the time
const [TIME_BEFORE, TIME_AFTER] = MEMBER_MODERATION_COPY.activeTime.split('{time}')

export interface MemberModerationViewProps {
  view: View | null
  // Viewer may open a live's report
  canOpenReports: boolean
}

/**
 * Moderation of one member: time spent, then live by live, the detail on click
 * @param {View | null} view - History
 * @param {boolean} canOpenReports - Report links shown
 * @return {JSX.Element}
 */

export const MemberModerationView = ({ view, canOpenReports }: MemberModerationViewProps) => {
  const [open, setOpen] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  if (!view) return <p className={LIVE_REPORT.notice}>{MEMBER_MODERATION_COPY.unavailable}</p>

  const size = LIVE_SETTINGS.memberLivesPageSize
  const pages = Math.max(1, Math.ceil(view.lives.length / size))
  const current = Math.min(page, pages)

  return (
    <div className={MEMBER_MODERATION.stack}>
      <Section
        title={MEMBER_MODERATION_COPY.windowTitle.replace(
          '{days}',
          String(LIVE_SETTINGS.hoursWindowDays)
        )}
        raised
      >
        <dl className={MEMBER_MODERATION.stats}>
          {[
            [MEMBER_MODERATION_COPY.windowVisible, formatSpan(view.windowSeconds)],
            [MEMBER_MODERATION_COPY.windowActive, formatSpan(view.windowActiveSeconds)],
            [MEMBER_MODERATION_COPY.windowLives, String(view.windowLives)],
          ].map(([label, value]) => (
            <div key={label} className={MEMBER_MODERATION.stat}>
              <dt className={MEMBER_MODERATION.statLabel}>{label}</dt>
              <dd className={MEMBER_MODERATION.statValue}>{value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title={MEMBER_MODERATION_COPY.livesTitle} padded>
        {view.lives.length === 0 ? (
          <p className={LIVE_REPORT.empty}>{MEMBER_MODERATION_COPY.empty}</p>
        ) : (
          <ul className={MEMBER_MODERATION.list}>
            {view.lives.slice((current - 1) * size, current * size).map((live) => {
              const platform = LIVE_PLATFORM_REGISTRY.get(live.platform)
              const PlatformIcon = ICONS[platform.icon]
              const isOpen = open === live.liveId

              return (
                <li key={live.liveId} className={MEMBER_MODERATION.item}>
                  <button
                    type="button"
                    className={MEMBER_MODERATION.row}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : live.liveId)}
                  >
                    <span className={MEMBER_MODERATION.rowAvatar}>
                      <Avatar name={live.creator} src={live.creatorAvatar} size="md" />
                      <PlatformIcon
                        className={MEMBER_MODERATION.rowPlatform}
                        aria-label={platform.label}
                      />
                    </span>
                    <span className={MEMBER_MODERATION.rowMain}>
                      <span className={MEMBER_MODERATION.rowTitle}>
                        {live.title} {live.isReinforcement && <ReinforcementTag />}
                      </span>
                      <span className={MEMBER_MODERATION.rowDate}>{formatDay(live.startedAt)}</span>
                      {live.span && <ModSpan span={live.span} />}
                    </span>
                    <span className={MEMBER_MODERATION.rowTime}>
                      {TIME_BEFORE}
                      <strong className={MEMBER_MODERATION.rowTimeValue}>
                        {formatExactSpan(live.activeSeconds)}
                      </strong>
                      {TIME_AFTER}
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
                                  <Dotted items={details} />
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
        <Pagination
          page={current}
          totalPages={pages}
          onPageChange={(next) => {
            setPage(next)
            setOpen(null)
          }}
        />
      </Section>
    </div>
  )
}
