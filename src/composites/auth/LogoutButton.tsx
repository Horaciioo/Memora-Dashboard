import { Button } from '@/components/elements/actions/Button'
import { logout } from '@/app/login/actions'

/**
 * Signs the demo session out
 * @return {JSX.Element} - Form & sign-out button
 */

export const LogoutButton = () => (
  <form action={logout}>
    <Button type="submit">Sign out</Button>
  </form>
)
