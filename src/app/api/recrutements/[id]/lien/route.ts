import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { emitLink, linkFields, revokeLink } from '@/core/services/onboarding/IntegrationLinkService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { INTEGRATION_LINK_COPY } from '@/declarations/onboarding/copy'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.IntegrationManage,
  status: 201,
  descriptor: { summary: 'Hand out the integration link of a campaign', tags: ['integration'] },
  handler: async ({ params, raw, session, scope }) => {
    const parsed = parseFormValues(linkFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const link = await emitLink(params.id, parsed.values, await scope(), session.id)

    await recordEvent({
      eventType: 'RecruitmentOpened',
      actorId: session.id,
      targetType: 'recruitment',
      targetId: params.id,
      summary: INTEGRATION_LINK_COPY.emitted,
    })

    return link
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.IntegrationManage,
  descriptor: { summary: 'Close the integration link of a campaign', tags: ['integration'] },
  handler: async ({ params, scope }) => {
    await revokeLink(params.id, await scope())

    return { ok: true }
  },
})
