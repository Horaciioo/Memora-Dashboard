import { ClimbGlyph, LagGlyph } from '@/components/elements/display/glyphs/Glyphs'
import { trendOf } from '@/core/lib/lives/hub'
import { LIVE_HUB_COPY } from '@/declarations/lives/hub'
import { LIVE_HUB_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface TrendMarkProps {
  value: number
  previous: number
}

/**
 * Arrow up or down with the share of the change, like the viewer files
 * @param {number} value - Latest period
 * @param {number} previous - Period before
 * @return {JSX.Element | null}
 */

export const TrendMark = ({ value, previous }: TrendMarkProps) => {
  const { direction, percent } = trendOf(value, previous)
  if (direction === 'flat') return null

  const Glyph = direction === 'up' ? ClimbGlyph : LagGlyph

  return (
    <span
      className={cn(
        LIVE_HUB_STYLES.trend,
        direction === 'up' ? LIVE_HUB_STYLES.trendUp : LIVE_HUB_STYLES.trendDown
      )}
    >
      <Glyph className={LIVE_HUB_STYLES.trendGlyph} />
      {percent === null ? LIVE_HUB_COPY.trendNew : `${percent} %`}
    </span>
  )
}
