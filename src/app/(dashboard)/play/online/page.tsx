import { redirect } from 'next/navigation'

import { ROUTES } from '@/declarations/navigation'

/**
 * Online players now live in the feed
 * @return {never} - Redirect
 */

export default function PlayOnlinePage(): never {
  redirect(ROUTES.playFeed)
}
