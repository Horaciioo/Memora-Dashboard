import { SubmitButton } from '@/components/elements/actions/SubmitButton'
import { logout } from '@/app/connexion/actions'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import type { ButtonVariant } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface LogoutButtonProps {
  // Danger by default
  variant?: ButtonVariant
  // Merged onto the button
  className?: string
  // Borderless glyph
  iconOnly?: boolean
}

/**
 * Ends the session through a plain form
 * @param {ButtonVariant} [variant] - Visual weight
 * @param {string} [className] - Extra classes merged onto the button
 * @param {boolean} [iconOnly] - Renders a borderless glyph instead of the labelled button
 * @return {JSX.Element} - Form and sign-out button
 */

export const LogoutButton = ({ variant = 'danger', className, iconOnly }: LogoutButtonProps) => (
  <form action={logout}>
    {iconOnly ? (
      <SubmitButton
        variant="icon"
        icon="signOut"
        aria-label={AUTH_COPY.signOut}
        className={className}
      />
    ) : (
      <SubmitButton variant={variant} className={cn('w-full', className)}>
        {AUTH_COPY.signOut}
      </SubmitButton>
    )}
  </form>
)
