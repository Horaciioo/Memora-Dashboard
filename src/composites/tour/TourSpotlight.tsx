import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { TOUR_SPOTLIGHT } from '@/declarations/ui/variants'
import type { TourRect } from '@/types/tour'

export interface TourSpotlightProps {
  // Lit part, none dims the whole screen
  rect: TourRect | null
  // The lit part answers clicks
  isInteractive: boolean
}

/**
 * Dims everything but one part of the page, the dimmed area swallows clicks
 * @param {TourSpotlightProps} props - Lit part
 * @return {JSX.Element}
 */

export const TourSpotlight = ({ rect, isInteractive }: TourSpotlightProps) => {
  if (!rect) return <span className={TOUR_SPOTLIGHT.dim} style={{ inset: 0 }} aria-hidden="true" />

  // Room around the part
  const pad = TOUR_SETTINGS.ringPaddingPx
  const top = Math.max(rect.top - pad, 0)
  const left = Math.max(rect.left - pad, 0)
  const width = rect.width + pad * 2
  const height = rect.height + pad * 2
  const hole = { top, left, width, height }

  return (
    <div aria-hidden="true">
      <span className={TOUR_SPOTLIGHT.dim} style={{ top: 0, left: 0, right: 0, height: top }} />
      <span
        className={TOUR_SPOTLIGHT.dim}
        style={{ top: top + height, left: 0, right: 0, bottom: 0 }}
      />
      <span className={TOUR_SPOTLIGHT.dim} style={{ top, left: 0, width: left, height }} />
      <span className={TOUR_SPOTLIGHT.dim} style={{ top, left: left + width, right: 0, height }} />
      {!isInteractive && <span className={TOUR_SPOTLIGHT.shield} style={hole} />}
    </div>
  )
}
