import type { Metadata } from 'next'
import { SanctionsScreen } from '@/composites/moderation/SanctionsScreen'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'

export const metadata: Metadata = { title: SANCTION_COPY.title }

/**
 * Twitch sanction panel
 * @param {Object} props - Address params
 * @return {Promise<JSX.Element>} - Moderation page
 */

export default async function SanctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ youtuber?: string }>
}) {
  const { youtuber } = await searchParams

  return <SanctionsScreen youtuberId={youtuber} />
}
