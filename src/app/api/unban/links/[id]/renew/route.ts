import { readText } from '@/core/lib/forms/values'
import { createProtectedRoute } from '@/core/lib/http/route'
import { unbanCaller } from '@/core/services/unban/caller'
import { renewLink } from '@/core/services/unban/UnbanLinkService'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { UNBAN_LINK_FIELDS } from '@/declarations/unban/fields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  status: 201,
  permission: Permissions.UnbanLinks,
  fields: UNBAN_LINK_FIELDS.filter((field) => field.name === 'expiryDays'),
  partial: true,
  descriptor: { summary: 'Replace a Deban. link by a new one', tags: ['unban'] },
  handler: async (context) =>
    renewLink(
      context.params.id,
      await unbanCaller(context),
      Number(readText(context.body, 'expiryDays')) || UNBAN_SETTINGS.defaultExpiryDays
    ),
})
