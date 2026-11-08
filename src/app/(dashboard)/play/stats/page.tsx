import { redirect } from 'next/navigation'

import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Stats page, closed until it is built
 * @return {Promise<never>} - Back to the hub
 */

export default async function PlayStatsPage() {
  await requirePermission(Permissions.PlayAccess)
  redirect(ROUTES.play)
}
