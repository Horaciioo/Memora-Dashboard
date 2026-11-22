import type { ReactNode } from 'react'

import { AvatarStack } from '@/components/elements/display/Avatar'
import type { LiveReport } from '@/core/lib/lives/report'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { CREATOR_BILAN } from '@/declarations/ui/variants'
import { formatHourMark } from '@/utils/format/time/dates'
import { formatSpan } from '@/utils/format/modview'
import { SECOND_MS } from '@/utils/constants/time'

export interface CreatorStoryProps {
  report: LiveReport
  start: string
  end: string
}

interface CardProps {
  title: string
  children: ReactNode
}

/**
 * One cell of the story: a kicker, a big line and its hint
 * @param {CardProps} props - Card content
 * @return {JSX.Element}
 */

const Card = ({ title, children }: CardProps) => (
  <section className={CREATOR_BILAN.storyCard}>
    <h3 className={CREATOR_BILAN.storyKicker}>{title}</h3>
    <div>{children}</div>
  </section>
)

/**
 * What happened during the live, told in four cards instead of a wall of text
 * @param {CreatorStoryProps} props - Report and span of the live
 * @return {JSX.Element}
 */

export const CreatorStory = ({ report, start, end }: CreatorStoryProps) => {
  const team = report.moderators.filter((row) => row.isMember)
  const seconds = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / SECOND_MS))

  return (
    <div className={CREATOR_BILAN.storyPanel}>
      <div className={CREATOR_BILAN.storyGrid}>
        <Card title={LIVE_REPORT_COPY.storyWhenTitle}>
          <p className={CREATOR_BILAN.storyTimes}>
            {formatHourMark(start)}
            <span className={CREATOR_BILAN.storyTimesArrow}>{LIVE_REPORT_COPY.storyTo}</span>
            {formatHourMark(end)}
          </p>
          <p className={CREATOR_BILAN.storyHint}>
            {LIVE_REPORT_COPY.storyWhenSpan.replace('{time}', formatSpan(seconds))}
          </p>
        </Card>

        <Card title={LIVE_REPORT_COPY.storyTeamTitle}>
          <p className={CREATOR_BILAN.storyBig}>
            {team.length === 0
              ? LIVE_REPORT_COPY.storyTeamNone
              : team.length === 1
                ? LIVE_REPORT_COPY.storyTeamOne
                : LIVE_REPORT_COPY.storyTeamMany.replace('{count}', String(team.length))}
          </p>
          {team.length > 0 && (
            <AvatarStack
              size="md"
              max={6}
              people={team.map((row) => ({ id: row.key, name: row.name, src: null }))}
            />
          )}
        </Card>

        <Card title={LIVE_REPORT_COPY.storyChatTitle}>
          <p className={CREATOR_BILAN.storyBig}>
            {report.actions === 0
              ? LIVE_REPORT_COPY.storyCalm
              : LIVE_REPORT_COPY.storyActionsBig.replace('{count}', String(report.actions))}
          </p>
          <p className={CREATOR_BILAN.storyHint}>
            {report.actions === 0
              ? LIVE_REPORT_COPY.storyCalmHint
              : LIVE_REPORT_COPY.storyActionsHint.replace(
                  '{targets}',
                  String(report.distinctTargets)
                )}
          </p>
        </Card>

        {report.teamActiveSeconds > 0 && (
          <Card title={LIVE_REPORT_COPY.storyTimeTitle}>
            <p className={CREATOR_BILAN.storyBig}>{formatSpan(report.teamActiveSeconds)}</p>
            <p className={CREATOR_BILAN.storyHint}>{LIVE_REPORT_COPY.storyTimeHint}</p>
          </Card>
        )}

        {report.peak && (
          <Card title={LIVE_REPORT_COPY.storyPeakTitle}>
            <p className={CREATOR_BILAN.storyBig}>
              {LIVE_REPORT_COPY.storyPeakBig.replace('{time}', formatHourMark(report.peak.at))}
            </p>
            <p className={CREATOR_BILAN.storyHint}>
              {LIVE_REPORT_COPY.storyPeakHint
                .replace('{count}', String(report.peak.count))
                .replace('{minutes}', String(LIVE_SETTINGS.reportBucketMinutes))}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
