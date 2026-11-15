import type { Metadata } from 'next'
import { UnbanScreen } from '@/composites/unban/UnbanScreen'
import { UNBAN_COPY } from '@/declarations/unban/copy'

export const metadata: Metadata = { title: UNBAN_COPY.title }

/**
 * Déban. requests
 * @return {Promise<JSX.Element>} - Moderation page
 */

export default function UnbanPage() {
  return <UnbanScreen />
}
