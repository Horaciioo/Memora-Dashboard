import { Avatar } from '@/components/elements/display/Avatar'
import { Section } from '@/components/structures/page/Section'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveModTime } from '@/types/lives'
import { formatHourMark } from '@/utils/format/dates'
import { formatSpan } from '@/utils/format/modview'

export interface AttendanceCompareProps {
  team: LiveModTime[]
}

/**
 * Hours given on the roll-call against the hours done, with the extra time
 * @param {LiveModTime[]} team - Who moderated
 * @return {JSX.Element}
 */

export const AttendanceCompare = ({ team }: AttendanceCompareProps) => {
  const rows = team.filter((member) => member.declared)
  const CrossIcon = ICONS.failure
  const CheckIcon = ICONS.picked

  // "De 20h à 22h" with the hours as the bilan says them
  const range = (from: string, to: string) =>
    LIVE_REPORT_COPY.spanRange
      .replace('{from}', formatHourMark(from))
      .replace('{to}', formatHourMark(to))

  return (
    <Section title={BILAN_COPY.attendanceTitle} description={BILAN_COPY.attendanceLead} padded>
      {rows.length === 0 ? (
        <p className={LIVE_REPORT.empty}>{BILAN_COPY.attendanceEmpty}</p>
      ) : (
        <table className={LIVE_REPORT.compare}>
          <thead>
            <tr>
              {[
                BILAN_COPY.attendanceWho,
                BILAN_COPY.attendanceGiven,
                BILAN_COPY.attendanceDone,
                BILAN_COPY.attendanceGap,
              ].map((label) => (
                <th key={label} scope="col" className={LIVE_REPORT.compareHead}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((member) => {
              const declared = member.declared as { from: string; to: string }

              return (
                <tr key={member.accountId} className={LIVE_REPORT.compareRow}>
                  <td className={LIVE_REPORT.compareCell}>
                    <span className={LIVE_REPORT.compareWho}>
                      <Avatar name={member.name} src={member.avatar} size="sm" />
                      {member.name}
                    </span>
                  </td>
                  <td className={LIVE_REPORT.compareCell}>{range(declared.from, declared.to)}</td>
                  <td className={LIVE_REPORT.compareCell}>
                    {member.isAbsent ? BILAN_COPY.attendanceNone : range(member.from, member.to)}
                  </td>
                  <td className={LIVE_REPORT.compareCell}>
                    {member.isAbsent ? (
                      <span className={LIVE_REPORT.compareMissed}>
                        <CrossIcon className={LIVE_REPORT.compareGlyph} aria-hidden="true" />
                        {LIVE_REPORT_COPY.absent}
                      </span>
                    ) : member.extraSeconds >= 60 ? (
                      <span className={LIVE_REPORT.compareExtra}>
                        {BILAN_COPY.attendanceExtra.replace(
                          '{time}',
                          formatSpan(member.extraSeconds)
                        )}
                      </span>
                    ) : (
                      <span className={LIVE_REPORT.compareInside}>
                        <CheckIcon className={LIVE_REPORT.compareGlyph} aria-hidden="true" />
                        {BILAN_COPY.attendanceInside}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </Section>
  )
}
