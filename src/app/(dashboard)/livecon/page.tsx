import { redirect } from 'next/navigation'
import { ROUTES } from '@/declarations/navigation'

/**
 * The livecon lives on the moderation board now, its own route only forwarding
 * @return {never} - Redirect
 */

export default function LiveconPage() {
  redirect(ROUTES.sanctions)
}
