import type { Metadata } from 'next'

import { PrintButton } from '@/components/elements/actions/PrintButton'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { readLiveReport } from '@/core/services/lives/LiveReportService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_REPORT_COPY, MODERATION_KINDS } from '@/declarations/lives/moderation'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_REPORT, PAGE_STYLES } from '@/declarations/ui/variants'
import { formatDay } from '@/utils/format/dates'
import { formatClock, formatSpan } from '@/utils/format/modview'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LIVE_REPORT_COPY.creatorTitle }

/**
 * Report of one live for its creator, in plain words, without viewer names nor excerpts
 * @param {Object} props - Route props
 * @param {Promise<{ id: string }>} props.params - Live identifier
 * @return {Promise<JSX.Element>} - Creator report page
 */

export default async function LiveCreatorReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { session, scope } = await requirePermission(Permissions.LiveCreatorReport)
  const { live, report } = await readLiveReport(id, await scope(), session.id, session.permissions)
  const start = live.startedAt ?? live.plannedStartAt
  const end = live.endedAt ?? new Date().toISOString()
  const team = report.moderators.filter((row) => row.isMember).length

  // Opening sentence, by team size
  const when = (
    team === 0
      ? LIVE_REPORT_COPY.creatorWhenNone
      : team === 1
        ? LIVE_REPORT_COPY.creatorWhenOne
        : LIVE_REPORT_COPY.creatorWhen
  )
    .replace('{day}', formatDay(start))
    .replace('{start}', formatClock(start))
    .replace('{end}', formatClock(end))
    .replace('{count}', String(team))

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader eyebrow={live.youtuber.name} title={LIVE_REPORT_COPY.creatorTitle} />
      <div className={LIVE_REPORT.toolbar}>
        <PrintButton label={LIVE_REPORT_COPY.print} />
      </div>

      <article className={LIVE_REPORT.letter}>
        <p className={LIVE_REPORT.sentence}>{LIVE_REPORT_COPY.creatorLead}</p>
        <p className={LIVE_REPORT.sentence}>{when}</p>
        <p className={LIVE_REPORT.sentence}>
          {report.actions === 0
            ? LIVE_REPORT_COPY.creatorQuiet
            : LIVE_REPORT_COPY.creatorActions
                .replace('{actions}', String(report.actions))
                .replace('{targets}', String(report.distinctTargets))}
        </p>
        {report.teamActiveSeconds > 0 && (
          <p className={LIVE_REPORT.sentence}>
            {LIVE_REPORT_COPY.creatorTime.replace('{time}', formatSpan(report.teamActiveSeconds))}
          </p>
        )}
        {report.peak && (
          <p className={LIVE_REPORT.sentence}>
            {LIVE_REPORT_COPY.creatorPeak
              .replace('{time}', formatClock(report.peak.at))
              .replace('{count}', String(report.peak.count))
              .replace('{minutes}', String(LIVE_SETTINGS.reportBucketMinutes))}
          </p>
        )}

        {report.byKind.length > 0 && (
          <Section title={LIVE_REPORT_COPY.kindsTitle} padded>
            <ul className={LIVE_REPORT.kinds}>
              {report.byKind.map((entry) => {
                const meta = MODERATION_KINDS[entry.kind]
                const Icon = ICONS[meta.icon]

                return (
                  <li key={entry.kind} className={LIVE_REPORT.kind}>
                    <Icon className={LIVE_REPORT.kindIcon} aria-hidden="true" />
                    <span className={LIVE_REPORT.kindLabel}>{meta.label}</span>
                    <span className={LIVE_REPORT.kindCount}>{entry.count}</span>
                  </li>
                )
              })}
            </ul>
          </Section>
        )}

        <Section title={LIVE_REPORT_COPY.creatorLevels} padded>
          {report.levels.length === 0 ? (
            <p className={LIVE_REPORT.empty}>{LIVE_REPORT_COPY.levelsEmpty}</p>
          ) : (
            <ul className={LIVE_REPORT.kinds}>
              {report.levels.map((level) => (
                <li key={level.from} className={LIVE_REPORT.kind}>
                  {LIVE_REPORT_COPY.creatorLevel
                    .replace('{name}', level.name)
                    .replace('{time}', formatClock(level.from))}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </article>
    </div>
  )
}
