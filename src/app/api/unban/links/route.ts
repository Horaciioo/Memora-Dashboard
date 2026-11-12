import { readText, readRequiredText } from '@/core/lib/forms/values'
import { createProtectedRoute } from '@/core/lib/http/route'
import { unbanCaller } from '@/core/services/unban/caller'
import { createLink, listLinks } from '@/core/services/unban/UnbanLinkService'
import { UNBAN_LINK_FIELDS } from '@/declarations/unban/fields'
import { Permissions } from '@/utils/constants/permissions'
import { UnbanLinkStates } from '@/utils/constants/unban'
import type { UnbanLinkStateName } from '@/utils/constants/unban'

export const GET = createProtectedRoute({
  permission: Permissions.UnbanLinks,
  descriptor: { summary: 'List the Deban. links of the perimeter', tags: ['unban'] },
  handler: async (context) => {
    const state = context.query.get('state')
    const page = Number(context.query.get('page'))

    return listLinks(
      {
        youtuberId: context.query.get('youtuberId') ?? undefined,
        state: Object.values(UnbanLinkStates).find((known) => known === state) as
          UnbanLinkStateName | undefined,
        page: Number.isInteger(page) ? page : undefined,
      },
      await unbanCaller(context)
    )
  },
})

export const POST = createProtectedRoute({
  status: 201,
  permission: Permissions.UnbanLinks,
  fields: UNBAN_LINK_FIELDS,
  descriptor: { summary: 'Make a Deban. link, its address is shown once', tags: ['unban'] },
  handler: async (context) =>
    createLink(
      {
        youtuberId: readRequiredText(context.body, 'youtuberId'),
        expiryDays: Number(readText(context.body, 'expiryDays')),
        expectedDiscordId: readText(context.body, 'expectedDiscordId'),
        label: readText(context.body, 'label'),
      },
      await unbanCaller(context)
    ),
})
