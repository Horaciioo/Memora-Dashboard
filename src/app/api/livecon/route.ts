import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  liveconFields,
  readCurrentState,
  switchLevel,
} from '@/core/services/livecon/LiveconService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveconRead,
  descriptor: { summary: 'Read the livecon in force', tags: ['livecon'] },
  handler: async ({ scope }) => readCurrentState(await scope()),
})

export const POST = createProtectedRoute({
  permission: Permissions.LiveconUpdate,
  status: 201,
  descriptor: { summary: 'Switch the livecon level', tags: ['livecon'] },
  handler: async ({ raw, session, scope }) => {
    const parsed = parseFormValues(await liveconFields(await scope()), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const state = await switchLevel(parsed.values, session.id, await scope())

    await recordEvent({
      eventType: 'LiveconChanged',
      actorId: session.id,
      targetType: 'livecon',
      summary: state[0]?.level.name ?? '',
    })

    return state
  },
})
