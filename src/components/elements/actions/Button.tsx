import type { ButtonHTMLAttributes } from 'react'
import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { BUTTON_STYLES, type ButtonVariant } from '@/declarations/ui/variants'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: IconName
  iconAfter?: IconName
  // Waiting on the server: locked, the brand mark running before the label
  isLoading?: boolean
}

/**
 * Styled button
 * @param {ButtonVariant} [variant] - Visual weight
 * @param {IconName} [icon] - Icon rendered instead of a label
 * @param {IconName} [iconAfter] - Icon rendered instead of a label
 * @param {boolean} [isLoading] - Locks the button, shows the loader
 * @return {JSX.Element}
 */

export const Button = ({
  variant = 'secondary',
  icon,
  iconAfter,
  isLoading,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) => {
  const noLabel = children === undefined || children === null
  const Leading = noLabel && icon ? ICONS[icon] : null
  const Trailing = noLabel && iconAfter ? ICONS[iconAfter] : null
  const isGlyphOnly = Boolean(Leading || Trailing)
  // Coloured fills carry the white mark as is
  const onFill = variant === 'primary' || variant === 'success' || variant === 'danger'

  return (
    <button
      type={type}
      className={cn(
        BUTTON_STYLES.base,
        BUTTON_STYLES[variant],
        isGlyphOnly && variant !== 'icon' && BUTTON_STYLES.square,
        // Stays fully lit while it works
        isLoading && 'disabled:opacity-100',
        className
      )}
      {...props}
      disabled={isLoading || props.disabled}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? (
        <BrandLoader variant={onFill ? 'inline' : 'ink'} />
      ) : (
        Leading && <Leading className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      {children}
      {Trailing && <Trailing className="h-4 w-4 shrink-0" aria-hidden="true" />}
    </button>
  )
}
