import { createProtectedRoute } from '@/core/lib/http/route'
import { PIM_FIELDS, removePim, updatePim } from '@/core/services/members/MemberFileService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.MemberPimWrite,
  fields: PIM_FIELDS,
  descriptor: { summary: 'Edit an individual review', tags: ['members'] },
  handler: ({ params, body }) => updatePim(params.id, body),
})

export const DELETE = createProtectedRoute({
  permission: Permissions.MemberPimWrite,
  descriptor: { summary: 'Drop an individual review', tags: ['members'] },
  handler: async ({ params }) => {
    await removePim(params.id)

    return { id: params.id }
  },
})
