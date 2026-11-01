import type { KeyboardEvent } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { useLiveEdit } from '@/composites/lives/LiveEditContext'
import { useLiveData } from '@/core/hooks/data/lives/useLiveData'
import { InlineText } from '@/components/structures/inline/InlineText'
import { Section } from '@/components/structures/page/Section'
import { ModSpan } from '@/composites/lives/ModSpan'
import { ReinforcementTag } from '@/composites/lives/ReinforcementTag'
import { timeTicks } from '@/core/lib/lives/timeTicks'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveModTime } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { formatHourMark } from '@/utils/format/dates'

export interface BilanModeratorsProps {
  team: LiveModTime[]
  start: string
  end: string
  // Picks one moderator to look at
  onPick?: (key: string) => void
  title?: string
}

/**
 * Share of the live a moment sits at, kept inside it
 * @param {string} moment - ISO moment
 * @param {number} from - Live start, epoch ms
 * @param {number} span - Live length, ms
 * @return {number} - Percent
 */

const place = (moment: string, from: number, span: number): number =>
  Math.min(100, Math.max(0, ((Date.parse(moment) - from) / span) * 100))

/**
 * Who moderated: each line has the person, their time, and their stretch coloured over the live
 * @param {LiveModTime[]} team - Who moderated
 * @param {string} start - Live start
 * @param {string} end - Live end
 * @param {(key: string) => void} [onPick] - Picks one moderator
 * @param {string} [title] - Section title
 * @return {JSX.Element}
 */

export const BilanModerators = ({ team, start, end, onPick, title }: BilanModeratorsProps) => {
  const { liveId, canEdit } = useLiveEdit()
  const data = useLiveData()
  const from = Date.parse(start)
  const span = Math.max(1, Date.parse(end) - from)
  const ticks = timeTicks(from, Date.parse(end))

  // A coloured zone from one moment to another
  const zone = (className: string, left: string, right: string) => {
    const begin = place(left, from, span)

    return (
      <span
        className={className}
        style={{ left: `${begin}%`, width: `${Math.max(0.8, place(right, from, span) - begin)}%` }}
      />
    )
  }

  // A time written under the track at its place
  const mark = (moment: string, className?: string) => (
    <span
      className={cn(LIVE_REPORT.teamMark, className)}
      style={{ left: `${place(moment, from, span)}%` }}
    >
      {formatHourMark(moment)}
    </span>
  )

  return (
    <Section
      title={title ?? LIVE_REPORT_COPY.teamTitle}
      description={LIVE_REPORT_COPY.teamLead}
      padded
    >
      {team.length === 0 ? (
        <p className={LIVE_REPORT.empty}>{LIVE_REPORT_COPY.teamEmpty}</p>
      ) : (
        <>
          <div className={LIVE_REPORT.teamAxis} aria-hidden="true">
            <span />
            <div className={LIVE_REPORT.teamAxisTrack}>
              {ticks.map((tick) => (
                <span
                  key={tick.at}
                  className={LIVE_REPORT.teamAxisLabel}
                  style={{ left: `${tick.percent}%` }}
                >
                  {formatHourMark(tick.at)}
                </span>
              ))}
            </div>
          </div>
          <ul className={LIVE_REPORT.team}>
            {team.map((member) => {
              const declared = member.declared
              const missed = member.isAbsent
              const early = declared && Date.parse(member.from) < Date.parse(declared.from)
              const late = declared && Date.parse(member.to) > Date.parse(declared.to)

              return (
                <li key={member.accountId} className={LIVE_REPORT.teamRow}>
                  <div
                    className={cn(LIVE_REPORT.teamIdentity, onPick && LIVE_REPORT.teamPickable)}
                    {...(onPick
                      ? {
                          role: 'button',
                          tabIndex: 0,
                          onClick: () => onPick(member.accountId),
                          onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                            if (event.key === 'Enter') onPick(member.accountId)
                          },
                        }
                      : {})}
                  >
                    <Avatar name={member.name} src={member.avatar} size="lg" />
                    <div className={LIVE_REPORT.teamText}>
                      <span className={LIVE_REPORT.teamWho}>
                        {member.name}
                        {member.reinforcement && <ReinforcementTag />}
                      </span>
                      {(member.reinforcement?.requestedBy || member.outside) && (
                        <span className={LIVE_REPORT.teamTags}>
                          {member.reinforcement?.requestedBy && (
                            <span className={LIVE_REPORT.teamNote}>
                              {LIVE_REPORT_COPY.requestedBy.replace(
                                '{name}',
                                member.reinforcement.requestedBy
                              )}
                            </span>
                          )}
                          {member.outside && (
                            <span className={LIVE_REPORT.teamNote}>{member.outside}</span>
                          )}
                        </span>
                      )}
                      <ModSpan span={member} />
                      {canEdit && (
                        <span className={LIVE_REPORT.teamNote}>
                          <InlineText
                            id={`time-${member.accountId}`}
                            value={String(Math.round(member.seconds / 60))}
                            onCommit={(minutes) =>
                              data.editTime(liveId, member.accountId, Number(minutes) * 60)
                            }
                          />
                          {LIVE_REPORT_COPY.activeMinutes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={LIVE_REPORT.teamTrackBox} aria-hidden="true">
                    <div className={LIVE_REPORT.teamTrack}>
                      {ticks.map((tick) => (
                        <span
                          key={tick.at}
                          className={LIVE_REPORT.teamGrid}
                          style={{ left: `${tick.percent}%` }}
                        />
                      ))}
                      {/* Hours given on the roll-call: a tinted zone, red when never there */}
                      {declared &&
                        zone(
                          missed ? LIVE_REPORT.teamZoneMissed : LIVE_REPORT.teamZone,
                          declared.from,
                          declared.to
                        )}
                      {!missed && zone(LIVE_REPORT.teamStretch, member.from, member.to)}
                      {/* Time outside those hours, in green */}
                      {!missed &&
                        early &&
                        zone(
                          LIVE_REPORT.teamExtra,
                          member.from,
                          Date.parse(member.to) < Date.parse(declared.from)
                            ? member.to
                            : declared.from
                        )}
                      {!missed &&
                        late &&
                        zone(
                          LIVE_REPORT.teamExtra,
                          Date.parse(member.from) > Date.parse(declared.to)
                            ? member.from
                            : declared.to,
                          member.to
                        )}
                    </div>
                    <div className={LIVE_REPORT.teamMarks}>
                      {missed && declared ? (
                        <>
                          {mark(declared.from, LIVE_REPORT.teamMarkMissed)}
                          {mark(declared.to, LIVE_REPORT.teamMarkMissed)}
                        </>
                      ) : (
                        <>
                          {mark(member.from)}
                          {mark(member.to)}
                        </>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </Section>
  )
}
