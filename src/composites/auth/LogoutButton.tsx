import { Button } from '@/components/elements/actions/Button'
import { logout } from '@/app/connexion/actions'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'

/**
 * Ends the session through a plain form, no client JavaScript required
 * @return {JSX.Element} - Form and sign-out button
 */

export const LogoutButton = () => (
  <form action={logout}>
    <Button type="submit" variant="danger" icon="signOut" className="w-full">
      {AUTH_COPY.signOut}
    </Button>
  </form>
)
