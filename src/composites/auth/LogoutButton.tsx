import { Button } from '@/components/elements/actions/Button'
import { logout } from '@/app/connexion/actions'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import type { ButtonVariant } from '@/declarations/ui/variants'

export interface LogoutButtonProps {
  // Danger by default, softened where the pair beside it must read evenly
  variant?: ButtonVariant
  className?: string
  // Borderless glyph, no label, for a tight row of controls
  iconOnly?: boolean
}

/**
 * Ends the session through a plain form, no client JavaScript required
 * @param {ButtonVariant} [variant] - Visual weight, defaults to danger
 * @param {string} [className] - Extra classes merged onto the form
 * @param {boolean} [iconOnly] - Renders a borderless glyph instead of the labelled button
 * @return {JSX.Element} - Form and sign-out button
 */

export const LogoutButton = ({ variant = 'danger', className, iconOnly }: LogoutButtonProps) =>
  iconOnly ? (
    <form action={logout} className={className}>
      <Button type="submit" variant="icon" icon="signOut" aria-label={AUTH_COPY.signOut} />
    </form>
  ) : (
    <form action={logout} className={className}>
      <Button type="submit" variant={variant} className="w-full">
        {AUTH_COPY.signOut}
      </Button>
    </form>
  )
