import type { Metadata } from 'next'
import { PublicStatus } from '@/composites/system/status/PublicStatus'
import { readStatusReport } from '@/core/services/system/StatusService'
import { optionalUser } from '@/core/wrappers/requireUser'
import { STATUS_COPY } from '@/declarations/system/monitoring/status'

export const metadata: Metadata = { title: STATUS_COPY.brand }

// Read again on every visit
export const dynamic = 'force-dynamic'

/**
 * Status page, in the app for a member and bare for anyone else
 * @return {Promise<JSX.Element>} - Status page
 */

export default async function StatusPage() {
  const [report, user] = await Promise.all([readStatusReport(), optionalUser()])

  return <PublicStatus report={report} isEmbedded={user !== null} />
}
