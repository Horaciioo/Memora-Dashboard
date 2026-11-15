import { createProtectedRoute } from '@/core/lib/http/route'
import { reviewTarget, unbanCaller } from '@/core/services/unban/caller'
import { markDiscordLifted } from '@/core/services/unban/UnbanRequestService'
import { UNBAN_VERSION_FIELD } from '@/declarations/unban/fields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.UnbanHandle,
  fields: [UNBAN_VERSION_FIELD],
  descriptor: { summary: 'Confirm the ban was lifted on Discord', tags: ['unban'] },
  handler: async (context) => markDiscordLifted(reviewTarget(context), await unbanCaller(context)),
})
