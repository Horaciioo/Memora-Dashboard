import type { CSSProperties } from 'react'

import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Colours a stat card can take
export const STAT_TONES = {
  brand: 'var(--color-brand-700)',
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  caution: 'var(--color-caution)',
  danger: 'var(--color-danger)',
  mauve: 'var(--color-mauve-600)',
} as const

export type StatTone = keyof typeof STAT_TONES

export interface StatCardProps {
  label: string
  value: string
  icon: IconName
  tone: StatTone
  // The few big figures read first
  isHero?: boolean
  // Makes the card a button
  onClick?: () => void
}

/**
 * One figure: its bare glyph, the number in the tone colour, a soft blob behind
 * @param {string} label - What the figure counts
 * @param {string} value - The figure, said
 * @param {IconName} icon - Glyph
 * @param {StatTone} tone - Colour
 * @param {boolean} [isHero] - Bigger card
 * @param {() => void} [onClick] - Opens the figure's detail
 * @return {JSX.Element}
 */

export const StatCard = ({ label, value, icon, tone, isHero = false, onClick }: StatCardProps) => {
  const Glyph = ICONS[icon]

  return (
    <div
      className={cn(
        LIVE_REPORT.statCard,
        isHero && LIVE_REPORT.statCardHero,
        onClick && LIVE_REPORT.statCardPickable
      )}
      {...(onClick
        ? {
            role: 'button',
            tabIndex: 0,
            onClick,
            onKeyDown: (event) => {
              if (event.key === 'Enter') onClick()
            },
          }
        : {})}
      style={{ '--tone': STAT_TONES[tone] } as CSSProperties}
    >
      <span className={LIVE_REPORT.statBlob} aria-hidden="true" />
      <span className={LIVE_REPORT.statIcon} aria-hidden="true">
        <Glyph className={LIVE_REPORT.statGlyph} />
      </span>
      <span className={LIVE_REPORT.statLabel}>{label}</span>
      <span className={cn(LIVE_REPORT.statValue, isHero && LIVE_REPORT.statValueHero)}>
        {value}
      </span>
    </div>
  )
}
