import { redirect } from 'next/navigation'
import { ROUTES } from '@/declarations/navigation'

/**
 * Entry point, everyone lands on their own dashboard
 * @return {never} - Redirect
 */

export default function HomePage() {
  redirect(ROUTES.dashboard)
}
