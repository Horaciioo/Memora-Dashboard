import { readText } from '@/core/lib/forms/values'
import { createProtectedRoute } from '@/core/lib/http/route'
import { unbanCaller } from '@/core/services/unban/caller'
import { extendLink, revokeLink } from '@/core/services/unban/UnbanLinkService'
import { UNBAN_LINK_FIELDS } from '@/declarations/unban/fields'
import { Permissions } from '@/utils/constants/permissions'

// Only the validity moves when a link is extended
const EXTEND_FIELDS = UNBAN_LINK_FIELDS.filter((field) => field.name === 'expiryDays')

export const PATCH = createProtectedRoute({
  permission: Permissions.UnbanLinks,
  fields: EXTEND_FIELDS,
  descriptor: { summary: 'Extend a Deban. link', tags: ['unban'] },
  handler: async (context) =>
    extendLink(
      context.params.id,
      Number(readText(context.body, 'expiryDays')),
      await unbanCaller(context)
    ),
})

export const DELETE = createProtectedRoute({
  permission: Permissions.UnbanLinks,
  descriptor: { summary: 'Revoke a Deban. link', tags: ['unban'] },
  handler: async (context) => revokeLink(context.params.id, await unbanCaller(context)),
})
