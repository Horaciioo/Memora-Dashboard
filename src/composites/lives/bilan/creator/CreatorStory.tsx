import type { CSSProperties, ReactNode } from 'react'

import { AvatarStack } from '@/components/elements/display/Avatar'
import { STAT_TONES } from '@/composites/lives/bilan/StatCard'
import type { StatTone } from '@/composites/lives/bilan/StatCard'
import type { LiveReport } from '@/core/lib/lives/report'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { CREATOR_BILAN } from '@/declarations/ui/variants'
import { formatHourMark } from '@/utils/format/dates'
import { formatSpan } from '@/utils/format/modview'

export interface CreatorStoryProps {
  report: LiveReport
  start: string
  end: string
}

interface CardProps {
  title: string
  icon: IconName
  tone: StatTone
  children: ReactNode
}

/**
 * One card of the story: a kicker, a glyph, a big line and its hint
 * @param {CardProps} props - Card content
 * @return {JSX.Element}
 */

const Card = ({ title, icon, tone, children }: CardProps) => {
  const Glyph = ICONS[icon]

  return (
    <section
      className={CREATOR_BILAN.storyCard}
      style={{ '--tone': STAT_TONES[tone] } as CSSProperties}
    >
      <span className={CREATOR_BILAN.storyBlob} aria-hidden="true" />
      <div className={CREATOR_BILAN.storyHead}>
        <h3 className={CREATOR_BILAN.storyKicker}>{title}</h3>
        <Glyph className={CREATOR_BILAN.storyGlyph} aria-hidden="true" />
      </div>
      <div>{children}</div>
    </section>
  )
}

/**
 * What happened during the live, told in four cards instead of a wall of text
 * @param {CreatorStoryProps} props - Report and span of the live
 * @return {JSX.Element}
 */

export const CreatorStory = ({ report, start, end }: CreatorStoryProps) => {
  const team = report.moderators.filter((row) => row.isMember)
  const seconds = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 1000))

  return (
    <div className={CREATOR_BILAN.storyGrid}>
      <Card title={LIVE_REPORT_COPY.storyWhenTitle} icon="clock" tone="brand">
        <p className={CREATOR_BILAN.storyTimes}>
          {formatHourMark(start)}
          <span className={CREATOR_BILAN.storyTimesArrow}>{LIVE_REPORT_COPY.storyTo}</span>
          {formatHourMark(end)}
        </p>
        <p className={CREATOR_BILAN.storyHint}>
          {LIVE_REPORT_COPY.storyWhenSpan.replace('{time}', formatSpan(seconds))}
        </p>
      </Card>

      <Card title={LIVE_REPORT_COPY.storyTeamTitle} icon="members" tone="info">
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

      <Card
        title={LIVE_REPORT_COPY.storyChatTitle}
        icon="shield"
        tone={report.actions === 0 ? 'success' : 'danger'}
      >
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
        <Card title={LIVE_REPORT_COPY.storyTimeTitle} icon="clock" tone="mauve">
          <p className={CREATOR_BILAN.storyBig}>{formatSpan(report.teamActiveSeconds)}</p>
          <p className={CREATOR_BILAN.storyHint}>{LIVE_REPORT_COPY.storyTimeHint}</p>
        </Card>
      )}

      {report.peak && (
        <Card title={LIVE_REPORT_COPY.storyPeakTitle} icon="liveDot" tone="caution">
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
  )
}
