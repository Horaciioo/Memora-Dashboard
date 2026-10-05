import { BADGE_STYLES } from '@/declarations/ui/variants'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { ACCENT_STYLES, TONES, accentVars, toTone, type Tone } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'
import { isHexColour } from '@/utils/format/colour'

export interface BadgeProps {
  label: string
  tone?: Tone
  // Stored colour
  accent?: string | null
  icon?: IconName
  // Same pill
  muted?: boolean
  className?: string
}

/**
 * Compact status pill
 * @param {string} label - Text shown inside the pill
 * @param {Tone} [tone] - Fallback tone
 * @param {string | null} [accent] - Stored colour taking over the tone
 * @param {IconName} [icon] - Icon rendered before the label
 * @param {boolean} [muted] - Desaturated fill
 * @param {string} [className] - Extra classes merged onto the pill
 * @return {JSX.Element}
 */

export const Badge = ({ label, tone = 'neutral', accent, icon, muted, className }: BadgeProps) => {
  const picked = isHexColour(accent)
  const styles = picked ? ACCENT_STYLES : TONES[toTone(accent, tone)]
  const Icon = icon ? ICONS[icon] : null

  return (
    <span
      className={cn(
        BADGE_STYLES.base,
        styles.solid,
        'text-[var(--color-on-brand)]',
        muted && BADGE_STYLES.muted,
        className
      )}
      style={picked ? accentVars(accent, tone) : undefined}
    >
      {Icon && <Icon className={BADGE_STYLES.icon} aria-hidden="true" />}
      {label}
    </span>
  )
}
