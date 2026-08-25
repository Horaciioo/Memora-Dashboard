import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { instantiatePanel, readPanel } from '@/core/services/sanctions/SanctionService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { assertInScope } from '@/core/services/auth/ScopeService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

// The creator whose panel is read, the level narrowing it to one rung set
const CREATOR_PARAM = 'youtubeur'
const LEVEL_PARAM = 'niveau'

export const GET = createProtectedRoute({
  permission: Permissions.SanctionRead,
  descriptor: { summary: 'Read a creator sanction panel', tags: ['sanctions'] },
  handler: async ({ query, scope }) => {
    const youtuberId = query.get(CREATOR_PARAM)
    if (!youtuberId) throw invalidInput([{ field: CREATOR_PARAM, message: FORM_COPY.required }])

    return readPanel(await scope(), youtuberId, query.get(LEVEL_PARAM))
  },
})

export const POST = createProtectedRoute({
  permission: Permissions.SanctionManage,
  status: 201,
  descriptor: { summary: 'Clone the declared panel onto a creator', tags: ['sanctions'] },
  handler: async ({ query, session, scope }) => {
    const youtuberId = query.get(CREATOR_PARAM)
    if (!youtuberId) throw invalidInput([{ field: CREATOR_PARAM, message: FORM_COPY.required }])

    const perimeter = await scope()
    assertInScope(perimeter, youtuberId)

    const created = await instantiatePanel(youtuberId)

    await recordEvent({
      eventType: 'SanctionChanged',
      actorId: session.id,
      targetType: 'sanctions',
      targetId: youtuberId,
      summary: String(created),
    })

    return readPanel(perimeter, youtuberId, query.get(LEVEL_PARAM))
  },
})
