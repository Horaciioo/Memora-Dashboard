import { createProtectedRoute } from '@/core/lib/http/route'
import {
  offenseFields,
  readOffense,
  removeOffense,
  updateOffense,
} from '@/core/services/sanctions/SanctionService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.SanctionRead,
  descriptor: { summary: 'Read one offence in full', tags: ['sanctions'] },
  handler: async ({ params, scope }) => readOffense(await scope(), params.id),
})

export const PATCH = createProtectedRoute({
  permission: Permissions.SanctionManage,
  fields: offenseFields(),
  partial: true,
  descriptor: { summary: 'Edit the wording of an offence', tags: ['sanctions'] },
  handler: async ({ params, body, session, scope }) => {
    const offense = await updateOffense(await scope(), params.id, body)

    await recordEvent({
      eventType: 'SanctionChanged',
      actorId: session.id,
      targetType: 'sanctions',
      targetId: offense.id,
      summary: offense.name,
    })

    return offense
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.SanctionManage,
  descriptor: { summary: 'Drop an offence', tags: ['sanctions'] },
  handler: async ({ params, session, scope }) => {
    const name = await removeOffense(await scope(), params.id)

    await recordEvent({
      eventType: 'SanctionChanged',
      actorId: session.id,
      targetType: 'sanctions',
      targetId: params.id,
      summary: name,
    })

    return { id: params.id }
  },
})
