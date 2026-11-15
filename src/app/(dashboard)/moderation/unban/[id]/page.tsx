import type { Metadata } from 'next'
import { UnbanScreen } from '@/composites/unban/UnbanScreen'
import { UNBAN_COPY } from '@/declarations/unban/copy'

export const metadata: Metadata = { title: UNBAN_COPY.title }

/**
 * One Déban. request, opened from a task or a notification
 * @param {Object} props - Address params
 * @return {Promise<JSX.Element>} - Moderation page
 */

export default async function UnbanRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <UnbanScreen requestId={id} />
}
