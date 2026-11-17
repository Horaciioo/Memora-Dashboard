import type { CSSProperties, ReactNode } from 'react'

import { ICONS, type IconName } from '@/declarations/ui/icons'
import { PLAY_HEALTH } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayStatCardProps {
  label: string
  icon: IconName
  // Colour token of the card, its title and its chart
  tone: string
  // Big figure and its unit
  value: string
  unit?: string
  // Line under the figure, or the day scrubbed
  caption?: string
  // Right of the title
  when?: string
  className?: string
  children?: ReactNode
}

/**
 * Health style card: tinted title, big figure, a chart beneath
 * @param {PlayStatCardProps} props - Title, figure and chart
 * @return {JSX.Element}
 */

export const PlayStatCard = ({
  label,
  icon,
  tone,
  value,
  unit,
  caption,
  when,
  className,
  children,
}: PlayStatCardProps) => {
  const Glyph = ICONS[icon]

  return (
    <article
      className={cn(PLAY_HEALTH.card, className)}
      style={{ '--tone': `var(${tone})` } as CSSProperties}
    >
      <header className={PLAY_HEALTH.cardHead}>
        <Glyph className={PLAY_HEALTH.cardGlyph} aria-hidden="true" />
        {label}
        {when && <span className={PLAY_HEALTH.cardWhen}>{when}</span>}
      </header>
      <div>
        <div className={PLAY_HEALTH.value}>
          <span className={PLAY_HEALTH.valueNumber}>{value}</span>
          {unit && <span className={PLAY_HEALTH.valueUnit}>{unit}</span>}
        </div>
        {caption && <span className={PLAY_HEALTH.caption}>{caption}</span>}
      </div>
      {children}
    </article>
  )
}
