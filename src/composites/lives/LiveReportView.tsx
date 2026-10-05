'use client'

import { useState } from 'react'

import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { Section } from '@/components/structures/Section'
import type { LiveLogLine } from '@/types/lives'
import type { LiveReport } from '@/core/lib/lives/report'
import {
  LIVECON_FRISE_COLOURS,
  LIVE_REPORT_COPY,
  MODERATION_KINDS,
} from '@/declarations/lives/moderation'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import { formatClock, formatDuration, formatSpan } from '@/utils/format/modview'

export interface LiveReportViewProps {
  report: LiveReport
  log: LiveLogLine[]
  start: string
  end: string
  available: boolean
}

// Value of the "everyone" filter
const EVERYONE = ''

/**
 * Activity of the live
 * @param {Object} props - Timeline props
 * @param {LiveReport} props.report - Report
 * @param {string} props.start - Live start
 * @param {string} props.end - Live end
 * @return {JSX.Element}
 */

const Timeline = ({ report, start, end }: { report: LiveReport; start: string; end: string }) => {
  const highest = Math.max(1, ...report.timeline.map((slice) => slice.count))
  const span = Math.max(1, Date.parse(end) - Date.parse(start))

  return (
    <div>
      <div className={LIVE_REPORT.chart} role="img" aria-label={LIVE_REPORT_COPY.timelineTitle}>
        {report.timeline.map((slice) => (
          <div key={slice.at} className={LIVE_REPORT.bar}>
            {slice.count > 0 ? (
              <div
                className={LIVE_REPORT.barFill}
                style={{ height: `${(slice.count / highest) * 100}%` }}
              />
            ) : (
              <div className={LIVE_REPORT.barEmpty} />
            )}
            <span
              className={LIVE_REPORT.barTip}
            >{`${formatClock(slice.at)} · ${slice.count}`}</span>
          </div>
        ))}
      </div>
      <div className={LIVE_REPORT.axis}>
        <span>{formatClock(start)}</span>
        <span>{formatClock(end)}</span>
      </div>
      {report.peak && (
        <p className={LIVE_REPORT.peak}>
          {LIVE_REPORT_COPY.peak
            .replace('{time}', formatClock(report.peak.at))
            .replace('{count}', String(report.peak.count))}
        </p>
      )}

      {report.levels.length > 0 && (
        <>
          <div className={LIVE_REPORT.frise} aria-label={LIVE_REPORT_COPY.levelsTitle}>
            {report.levels.map((level) => {
              const from = Math.max(Date.parse(start), Date.parse(level.from))
              const to = Math.min(
                Date.parse(end),
                level.to ? Date.parse(level.to) : Date.parse(end)
              )

              return (
                <span
                  key={level.from}
                  className={LIVE_REPORT.friseSlice}
                  title={`${level.name} · ${formatClock(level.from)}`}
                  style={{
                    width: `${(Math.max(0, to - from) / span) * 100}%`,
                    backgroundColor: LIVECON_FRISE_COLOURS[level.level],
                  }}
                />
              )
            })}
          </div>
          <div className={LIVE_REPORT.friseLegend}>
            {report.levels.map((level) => (
              <span key={level.from} className={LIVE_REPORT.friseKey}>
                <span
                  className={LIVE_REPORT.friseDot}
                  style={{ backgroundColor: LIVECON_FRISE_COLOURS[level.level] }}
                />
                {`${level.name} · ${formatClock(level.from)}`}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Report of a live for the team: figures, timeline, moderators, gestures, then the full log
 * @param {LiveReportViewProps} props - Report and log
 * @return {JSX.Element}
 */

export const LiveReportView = ({ report, log, start, end, available }: LiveReportViewProps) => {
  const [actor, setActor] = useState(EVERYONE)
  const busiest = Math.max(1, ...report.moderators.map((row) => row.actions))
  const shown = actor === EVERYONE ? log : log.filter((line) => line.actorKey === actor)
  const duration = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 1000))

  const figures = [
    { label: LIVE_REPORT_COPY.duration, value: formatSpan(duration) },
    { label: LIVE_REPORT_COPY.actions, value: String(report.actions) },
    { label: LIVE_REPORT_COPY.targets, value: String(report.distinctTargets) },
    { label: LIVE_REPORT_COPY.teamTime, value: formatSpan(report.teamActiveSeconds) },
  ]

  return (
    <div className={LIVE_REPORT.wrapper}>
      {!available && <p className={LIVE_REPORT.notice}>{LIVE_REPORT_COPY.unavailable}</p>}

      <div className={LIVE_REPORT.figures}>
        {figures.map((figure) => (
          <div key={figure.label} className={LIVE_REPORT.figure}>
            <span className={LIVE_REPORT.figureLabel}>{figure.label}</span>
            <span className={LIVE_REPORT.figureValue}>{figure.value}</span>
          </div>
        ))}
      </div>

      <Section
        title={LIVE_REPORT_COPY.timelineTitle}
        description={LIVE_REPORT_COPY.timelineLead.replace(
          '{minutes}',
          String(LIVE_SETTINGS.reportBucketMinutes)
        )}
        padded
      >
        <Timeline report={report} start={start} end={end} />
      </Section>

      <Section
        title={LIVE_REPORT_COPY.moderatorsTitle}
        description={LIVE_REPORT_COPY.moderatorsLead}
        padded
      >
        {report.moderators.length === 0 ? (
          <p className={LIVE_REPORT.empty}>{LIVE_REPORT_COPY.logEmpty}</p>
        ) : (
          <ul className={LIVE_REPORT.rows}>
            {report.moderators.map((row) => (
              <li key={row.key} className={LIVE_REPORT.row}>
                <span className={row.isMember ? LIVE_REPORT.rowName : LIVE_REPORT.rowNameMuted}>
                  {row.name}
                </span>
                <span className={LIVE_REPORT.rowTrack}>
                  <span
                    className={LIVE_REPORT.rowFill}
                    style={{ width: `${(row.actions / busiest) * 100}%` }}
                  />
                </span>
                <span className={LIVE_REPORT.rowValue}>
                  {row.actions}
                  <span className={LIVE_REPORT.rowMeta}>
                    {row.isMember
                      ? `${formatSpan(row.activeSeconds)} ${LIVE_REPORT_COPY.active}, ${formatSpan(row.visibleSeconds)} ${LIVE_REPORT_COPY.visible}`
                      : LIVE_REPORT_COPY.outsideMemora}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

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

      <Section
        title={LIVE_REPORT_COPY.logTitle}
        description={LIVE_REPORT_COPY.logLead}
        action={
          report.moderators.length > 1 ? (
            <SelectMenu
              label={LIVE_REPORT_COPY.logFilter}
              value={actor}
              onChange={setActor}
              options={[
                { value: EVERYONE, label: LIVE_REPORT_COPY.logEveryone },
                ...report.moderators.map((row) => ({ value: row.key, label: row.name })),
              ]}
            />
          ) : undefined
        }
        padded
      >
        {shown.length === 0 ? (
          <p className={LIVE_REPORT.empty}>{LIVE_REPORT_COPY.logEmpty}</p>
        ) : (
          <ol className={LIVE_REPORT.log}>
            {shown.map((line) => {
              const meta = MODERATION_KINDS[line.kind]
              const Icon = ICONS[meta.icon]
              const details = [
                line.targetLogin,
                line.durationSeconds ? formatDuration(line.durationSeconds) : null,
                line.reason,
                line.excerpt,
              ].filter(Boolean)

              return (
                <li key={line.id} className={LIVE_REPORT.line}>
                  <time className={LIVE_REPORT.lineTime}>{formatClock(line.occurredAt)}</time>
                  <span
                    className={line.isMember ? LIVE_REPORT.lineActor : LIVE_REPORT.rowNameMuted}
                  >
                    {line.actorName}
                  </span>
                  <span className={LIVE_REPORT.lineBody}>
                    <span className={LIVE_REPORT.lineWhat}>
                      <Icon className={LIVE_REPORT.lineIcon} aria-hidden="true" />
                      {meta.label}
                      {line.status === 'FAILED' && (
                        <span className={LIVE_REPORT.lineFailed}>{LIVE_REPORT_COPY.refused}</span>
                      )}
                      {line.status === 'PENDING' && (
                        <span className={LIVE_REPORT.lineDetail}>{LIVE_REPORT_COPY.pending}</span>
                      )}
                    </span>
                    {details.length > 0 && (
                      <span className={LIVE_REPORT.lineDetail}>{details.join(' · ')}</span>
                    )}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </Section>
    </div>
  )
}
