import { forbidden, invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { legacyFields, listTracks, openTrack } from '@/core/services/academy/LegacyService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LegacyRead,
  descriptor: { summary: 'List the Legacy tracks', tags: ['legacy'] },
  handler: async () => listTracks(),
})

export const POST = createProtectedRoute({
  permission: Permissions.LegacyManage,
  status: 201,
  descriptor: { summary: 'Open a Legacy track', tags: ['legacy'] },
  handler: async ({ raw, session, access }) => {
    // Only an admin opens a track
    if (!access.isAdmin) throw forbidden()

    const parsed = parseFormValues(await legacyFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return openTrack(parsed.values, session.id)
  },
})
