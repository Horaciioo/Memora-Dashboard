import type { Metadata } from 'next'
import { SanctionsScreen } from '@/composites/moderation/SanctionsScreen'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'

export const metadata: Metadata = { title: SANCTION_COPY.discordTitle }

/**
 * Discord sanction panel
 * @return {Promise<JSX.Element>} - Moderation page
 */

export default async function DiscordSanctionsPage() {
  return <SanctionsScreen discord />
}
