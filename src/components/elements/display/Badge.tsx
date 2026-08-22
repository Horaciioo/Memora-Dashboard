import { BADGE_STYLES } from '@/declarations/ui/variants'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { TONES, type Tone } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'

export interface BadgeProps {
  label: string
  tone?: Tone
  icon?: IconName
  // Adds a coloured dot instead of an icon
  dot?: boolean
  className?: string
}

/**
 * Compact status pill, its tone always paired with a label so colour is never the only carrier
 * @param {string} label - Text shown inside the pill
 * @param {Tone} [tone] - Colour tone, defaults to neutral
 * @param {IconName} [icon] - Icon rendered before the label
 * @param {boolean} [dot] - Renders a coloured dot before the label
 * @param {string} [className] - Extra classes merged onto the pill
 * @return {JSX.Element}
 */

export const Badge = ({ label, tone = 'neutral', icon, dot, className }: BadgeProps) => {
  const styles = TONES[tone]
  const Icon = icon ? ICONS[icon] : null

  return (
    <span className={cn(BADGE_STYLES.base, styles.soft, styles.text, className)}>
      {dot && <span className={cn(BADGE_STYLES.dot, styles.dot)} aria-hidden="true" />}
      {Icon && <Icon className={BADGE_STYLES.icon} aria-hidden="true" />}
      {label}
    </span>
  )
}
