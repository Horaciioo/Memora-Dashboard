import type { ButtonHTMLAttributes } from 'react'
import { BUTTON_STYLES, type ButtonVariant } from '@/declarations/ui/variants'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: IconName
  iconAfter?: IconName
}

/**
 * Styled button
 * @param {ButtonVariant} [variant] - Visual weight
 * @param {IconName} [icon] - Icon rendered instead of a label
 * @param {IconName} [iconAfter] - Icon rendered instead of a label
 * @return {JSX.Element}
 */

export const Button = ({
  variant = 'secondary',
  icon,
  iconAfter,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) => {
  const noLabel = children === undefined || children === null
  const Leading = noLabel && icon ? ICONS[icon] : null
  const Trailing = noLabel && iconAfter ? ICONS[iconAfter] : null
  const isGlyphOnly = Boolean(Leading || Trailing)

  return (
    <button
      type={type}
      className={cn(
        BUTTON_STYLES.base,
        BUTTON_STYLES[variant],
        isGlyphOnly && variant !== 'icon' && BUTTON_STYLES.square,
        className
      )}
      {...props}
    >
      {Leading && <Leading className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {children}
      {Trailing && <Trailing className="h-4 w-4 shrink-0" aria-hidden="true" />}
    </button>
  )
}
