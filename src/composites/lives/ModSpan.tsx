import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveSpan } from '@/types/lives'
import { formatHourMark } from '@/utils/format/dates'
import { formatSpan } from '@/utils/format/modview'

export interface ModSpanProps {
  span: LiveSpan
}

/**
 * Hours of a span, each hour in bold
 * @param {string} from - ISO start
 * @param {string} to - ISO end
 * @return {JSX.Element}
 */

const Hours = ({ from, to }: { from: string; to: string }) => {
  const [before, rest] = LIVE_REPORT_COPY.spanRange.split('{from}')
  const [between, after] = rest.split('{to}')

  return (
    <>
      {before}
      <strong className={LIVE_REPORT.spanHour}>{formatHourMark(from)}</strong>
      {between}
      <strong className={LIVE_REPORT.spanHour}>{formatHourMark(to)}</strong>
      {after}
    </>
  )
}

/**
 * Time moderated in blue then the hours it ran between, in red when the hours given were missed
 * @param {LiveSpan} span - Time moderated against the hours given
 * @return {JSX.Element}
 */

export const ModSpan = ({ span }: ModSpanProps) => {
  const CrossIcon = ICONS.failure

  if (span.isAbsent) {
    return (
      <span className={LIVE_REPORT.spanAbsent}>
        <Hours from={span.from} to={span.to} />
        <CrossIcon className={LIVE_REPORT.spanAbsentGlyph} aria-hidden="true" />
        {LIVE_REPORT_COPY.absent}
      </span>
    )
  }

  return (
    <span className={LIVE_REPORT.teamSpan}>
      <strong className={LIVE_REPORT.spanTotal}>{formatSpan(span.seconds)}</strong>
      {' - '}
      <Hours from={span.from} to={span.to} />
      {span.extraSeconds >= 60 && (
        <span className={LIVE_REPORT.spanExtra}>
          {LIVE_REPORT_COPY.extra.replace('{time}', formatSpan(span.extraSeconds))}
        </span>
      )}
    </span>
  )
}
