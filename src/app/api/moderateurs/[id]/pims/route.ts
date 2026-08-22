import { createProtectedRoute } from '@/core/lib/http/route'
import { PIM_FIELDS, addPim } from '@/core/services/members/MemberFileService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.MemberPimWrite,
  status: 201,
  fields: PIM_FIELDS,
  descriptor: { summary: 'Record an individual review', tags: ['members'] },
  handler: async ({ params, body, session }) => {
    const pim = await addPim(params.id, session.id, body)

    await recordEvent({
      eventType: 'PimHeld',
      actorId: session.id,
      subjectId: params.id,
      targetType: 'member',
      targetId: params.id,
      summary: pim.heldAt.slice(0, 10),
    })

    return pim
  },
})
