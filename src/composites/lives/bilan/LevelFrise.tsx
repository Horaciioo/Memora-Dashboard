import type { LiveReport } from '@/core/lib/lives/report'
import { Dotted } from '@/components/elements/display/Dotted'
import { LIVECON_FRISE_COLOURS, LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import { formatClock } from '@/utils/format/modview'

export interface LevelFriseProps {
  levels: LiveReport['levels']
  start: string
  end: string
}

/**
 * Livecon levels along the live
 * @param {LiveReport['levels']} levels - Levels in force
 * @param {string} start - Live start
 * @param {string} end - Live end
 * @return {JSX.Element | null}
 */

export const LevelFrise = ({ levels, start, end }: LevelFriseProps) => {
  // A single level all along says nothing
  if (levels.length < 2) return null
  const span = Math.max(1, Date.parse(end) - Date.parse(start))

  return (
    <div className={LIVE_REPORT.friseBlock}>
      <h4 className={LIVE_REPORT.figureGroupTitle}>{LIVE_REPORT_COPY.levelsTitle}</h4>
      <div className={LIVE_REPORT.frise} aria-label={LIVE_REPORT_COPY.levelsTitle}>
        {levels.map((level) => {
          const from = Math.max(Date.parse(start), Date.parse(level.from))
          const to = Math.min(Date.parse(end), level.to ? Date.parse(level.to) : Date.parse(end))

          return (
            <span
              key={level.from}
              className={LIVE_REPORT.friseSlice}
              title={`${level.name}, ${formatClock(level.from)}`}
              style={{
                width: `${(Math.max(0, to - from) / span) * 100}%`,
                backgroundColor: LIVECON_FRISE_COLOURS[level.level],
              }}
            />
          )
        })}
      </div>
      <div className={LIVE_REPORT.friseLegend}>
        {levels.map((level) => (
          <span key={level.from} className={LIVE_REPORT.friseKey}>
            <span
              className={LIVE_REPORT.friseDot}
              style={{ backgroundColor: LIVECON_FRISE_COLOURS[level.level] }}
            />
            <Dotted items={[level.name, formatClock(level.from)]} />
          </span>
        ))}
      </div>
    </div>
  )
}
