import { readTarget } from '@/app/api/sanctions/target'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createOffense, offenseFields } from '@/core/services/sanctions/SanctionService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.SanctionManage,
  status: 201,
  fields: offenseFields().filter((field) => field.name === 'name'),
  descriptor: { summary: 'Add an offence to a creator panel', tags: ['sanctions'] },
  handler: async ({ query, body, session, scope }) => {
    const { youtuberId, panel } = readTarget(query)
    const offense = await createOffense(await scope(), youtuberId, panel, String(body.name))

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
