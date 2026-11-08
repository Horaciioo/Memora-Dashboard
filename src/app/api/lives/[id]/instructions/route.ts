import { createProtectedRoute } from '@/core/lib/http/route'
import { saveInstructions } from '@/core/services/lives/LiveService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Rewrite the instructions of a live', tags: ['lives'] },
  handler: async ({ params, raw, session, scope }) =>
    saveInstructions({
      id: params.id,
      instructions: typeof raw.instructions === 'string' ? raw.instructions : '',
      scope: await scope(),
      viewerId: session.id,
      held: session.permissions,
    }),
})
