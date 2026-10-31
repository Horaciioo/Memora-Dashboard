import type { Metadata } from 'next'
import { SanctionsScreen } from '@/composites/moderation/SanctionsScreen'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'

export const metadata: Metadata = { title: SANCTION_COPY.discordTitle }

/**
 * Discord sanction panel
 * @param {Object} props - Address params
 * @return {Promise<JSX.Element>} - Moderation page
 */

export default async function DiscordSanctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ youtuber?: string }>
}) {
  const { youtuber } = await searchParams

  return <SanctionsScreen discord youtuberId={youtuber} />
}
