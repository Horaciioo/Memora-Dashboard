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
 * Styled button, primary for the page's main call to action, secondary otherwise
 * @param {ButtonVariant} [variant] - Visual weight, defaults to secondary
 * @param {IconName} [icon] - Icon rendered before the label
 * @param {IconName} [iconAfter] - Icon rendered after the label
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
  const Leading = icon ? ICONS[icon] : null
  const Trailing = iconAfter ? ICONS[iconAfter] : null

  return (
    <button
      type={type}
      className={cn(BUTTON_STYLES.base, BUTTON_STYLES[variant], className)}
      {...props}
    >
      {Leading && <Leading className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {children}
      {Trailing && <Trailing className="h-4 w-4 shrink-0" aria-hidden="true" />}
    </button>
  )
}
