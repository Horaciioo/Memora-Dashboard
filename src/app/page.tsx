import { redirect } from 'next/navigation'
import { ROUTES } from '@/declarations/navigation'

/**
 * Entry point
 * @return {never} - Redirect
 */

export default function HomePage() {
  redirect(ROUTES.dashboard)
}
