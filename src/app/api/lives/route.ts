import { createProtectedRoute } from '@/core/lib/http/route'
import { announceLive, listOpenLives, liveFields } from '@/core/services/lives/LiveService'
import { parseFormValues } from '@/core/lib/forms'
import { invalidInput } from '@/core/lib/errors'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the open lives', tags: ['lives'] },
  handler: async ({ session, scope }) =>
    listOpenLives(await scope(), session.id, session.permissions),
})

export const POST = createProtectedRoute({
  permission: Permissions.LiveAnnounce,
  status: 201,
  descriptor: { summary: 'Announce a live', tags: ['lives'] },
  handler: async ({ raw, session, scope }) => {
    const perimeter = await scope()
    const parsed = parseFormValues(await liveFields(perimeter), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const id = await announceLive(parsed.values, session.id, perimeter)

    await recordEvent({
      eventType: 'LiveAnnounced',
      actorId: session.id,
      targetType: 'live',
      targetId: id,
      summary: String(parsed.values.title ?? ''),
    })

    return { id }
  },
})
