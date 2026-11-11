import { notFound } from 'next/navigation'

import { getSession } from '@/core/lib/auth/getSession'
import { NexusReturn } from '@/composites/nexus/NexusReturn'
import { isNexusConfigured } from '@/declarations/nexus/owner'

/**
 * Landing of the second factor popup
 * @param {Object} props - Page props
 * @param {Promise<{ status?: string }>} props.searchParams - Query
 * @return {Promise<JSX.Element>} - Page
 */

export default async function NexusReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  // The page does not exist for anyone else
  const session = await getSession()
  if (!session?.isRoot || !isNexusConfigured()) notFound()

  const { status } = await searchParams

  return <NexusReturn succeeded={status === 'ok'} />
}
