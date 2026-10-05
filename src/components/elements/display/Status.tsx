import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { accentPaint } from '@/declarations/ui/theme'
import type { Tone } from '@/declarations/ui/theme'
import { STATUS_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface StatusProps {
  label: string
  tone?: Tone
  // Stored colour
  accent?: string | null
  icon?: IconName
  // Done or past
  muted?: boolean
  className?: string
}

/**
 * Status read by the colour of its words
 * @param {StatusProps} props - Label and colour
 * @return {JSX.Element}
 */

export const Status = ({
  label,
  tone = 'neutral',
  accent,
  icon,
  muted,
  className,
}: StatusProps) => {
  const paint = accentPaint(accent, tone)
  const Icon = icon ? ICONS[icon] : null

  return (
    <span
      className={cn(STATUS_STYLES.base, paint.text, muted && STATUS_STYLES.muted, className)}
      style={paint.style}
    >
      {Icon && <Icon className={STATUS_STYLES.icon} aria-hidden="true" />}
      {label}
    </span>
  )
}
