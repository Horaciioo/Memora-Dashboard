import { createProtectedRoute } from '@/core/lib/http/route'
import { readTarget } from '@/app/api/sanctions/target'
import { instantiatePanel, readPanel } from '@/core/services/sanctions/SanctionService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { assertInScope } from '@/core/services/auth/ScopeService'
import { SANCTION_PARAMS } from '@/declarations/sanctions/params'
import { SANCTION_PANEL_REGISTRY } from '@/declarations/sanctions/registries'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.SanctionRead,
  descriptor: { summary: 'Read a creator sanction panel', tags: ['sanctions'] },
  handler: async ({ query, scope }) => {
    const { youtuberId, panel } = readTarget(query)

    return readPanel(await scope(), youtuberId, panel, query.get(SANCTION_PARAMS.level))
  },
})

export const POST = createProtectedRoute({
  permission: Permissions.SanctionManage,
  status: 201,
  descriptor: { summary: 'Clone the reference panel onto a creator', tags: ['sanctions'] },
  handler: async ({ query, session, scope }) => {
    const { youtuberId, panel } = readTarget(query)

    const perimeter = await scope()
    assertInScope(perimeter, youtuberId)

    const created = await instantiatePanel(
      youtuberId,
      panel,
      query.get(SANCTION_PARAMS.replace) === SANCTION_PARAMS.yes
    )

    await recordEvent({
      eventType: 'SanctionChanged',
      actorId: session.id,
      targetType: 'sanctions',
      targetId: youtuberId,
      summary: `${SANCTION_PANEL_REGISTRY.label(panel)} · ${created}`,
    })

    return readPanel(perimeter, youtuberId, panel, query.get(SANCTION_PARAMS.level))
  },
})
