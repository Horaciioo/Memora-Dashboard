import { BADGE_STYLES } from '@/declarations/ui/variants'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { ACCENT_STYLES, TONES, accentVars, toTone, type Tone } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'
import { isHexColour } from '@/utils/format/colour'

export interface BadgeProps {
  label: string
  tone?: Tone
  // Stored colour, a picked hexadecimal or a legacy tone key, winning over the tone
  accent?: string | null
  icon?: IconName
  // Adds a coloured dot instead of an icon
  dot?: boolean
  className?: string
}

/**
 * Compact status pill, its tone always paired with a label so colour is never the only carrier
 * @param {string} label - Text shown inside the pill
 * @param {Tone} [tone] - Fallback tone, defaults to neutral
 * @param {string | null} [accent] - Stored colour taking over the tone
 * @param {IconName} [icon] - Icon rendered before the label
 * @param {boolean} [dot] - Renders a coloured dot before the label
 * @param {string} [className] - Extra classes merged onto the pill
 * @return {JSX.Element}
 */

export const Badge = ({ label, tone = 'neutral', accent, icon, dot, className }: BadgeProps) => {
  const picked = isHexColour(accent)
  const styles = picked ? ACCENT_STYLES : TONES[toTone(accent, tone)]
  const Icon = icon ? ICONS[icon] : null

  return (
    <span
      className={cn(BADGE_STYLES.base, styles.solid, 'text-[var(--color-on-brand)]', className)}
      style={picked ? accentVars(accent, tone) : undefined}
    >
      {dot && (
        <span
          className={cn(BADGE_STYLES.dot, 'bg-[var(--color-on-brand)]/70')}
          aria-hidden="true"
        />
      )}
      {Icon && <Icon className={BADGE_STYLES.icon} aria-hidden="true" />}
      {label}
    </span>
  )
}
