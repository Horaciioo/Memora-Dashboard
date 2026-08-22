import type { ButtonHTMLAttributes } from 'react'
import { BUTTON_STYLES, type ButtonVariant } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

/**
 * Styled button, primary for the page's main call to action, secondary otherwise
 * @param {ButtonVariant} [variant] - Visual weight, defaults to secondary
 * @return {JSX.Element}
 */

export const Button = ({
  variant = 'secondary',
  className,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(BUTTON_STYLES.base, BUTTON_STYLES[variant], className)}
    {...props}
  />
)
