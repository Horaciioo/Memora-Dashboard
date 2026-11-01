'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { Dotted } from '@/components/elements/display/Dotted'
import Link from '@/components/elements/navigation/AppLink'
import { useState } from 'react'

import { Pagination } from '@/components/elements/navigation/Pagination'
import { Section } from '@/components/structures/page/Section'
import { LiveRemovalDialog, RemovableLive } from '@/composites/lives/RemovableLive'
import { GestureFields, GestureItem } from '@/composites/lives/EditableGesture'
import { InlineText } from '@/components/structures/inline/InlineText'
import { useLiveData } from '@/core/hooks/data/lives/useLiveData'
import { useLiveRemoval } from '@/core/hooks/data/lives/useLiveRemoval'
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
  // Viewer erases a live
  canDelete: boolean
  // Member whose file it is
  accountId: string
}

/**
 * Moderation of one member: time spent, then live by live, the detail on click
 * @param {View | null} view - History
 * @param {boolean} canOpenReports - Report links shown
 * @param {boolean} canDelete - Lives erased and their data corrected
 * @param {string} accountId - Member
 * @return {JSX.Element}
 */

export const MemberModerationView = ({
  view,
  canOpenReports,
  canDelete,
  accountId,
}: MemberModerationViewProps) => {
  const removal = useLiveRemoval()
  const data = useLiveData()
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
                <RemovableLive
                  key={live.liveId}
                  liveId={live.liveId}
                  removal={removal}
                  enabled={canDelete}
                  className={MEMBER_MODERATION.item}
                >
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
                              <GestureItem
                                key={line.id}
                                liveId={live.liveId}
                                line={line}
                                canEdit={canDelete}
                              >
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
                                {canDelete ? (
                                  <GestureFields liveId={live.liveId} line={line} />
                                ) : (
                                  <span className={LIVE_REPORT.lineDetail}>
                                    <Dotted items={details} />
                                  </span>
                                )}
                              </GestureItem>
                            )
                          })}
                        </ol>
                      )}
                      {canDelete && (
                        <span className={LIVE_REPORT.lineDetail}>
                          <InlineText
                            id={`time-${live.liveId}`}
                            value={String(Math.round(live.activeSeconds / 60))}
                            onCommit={(minutes) =>
                              data.editTime(live.liveId, accountId, Number(minutes) * 60)
                            }
                          />
                          {LIVE_REPORT_COPY.activeMinutes}
                        </span>
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
                </RemovableLive>
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
        <LiveRemovalDialog removal={removal} />
      </Section>
    </div>
  )
}
