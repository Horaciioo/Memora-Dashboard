import { createProtectedRoute } from '@/core/lib/http/route'
import { historyFiguresOf } from '@/core/lib/lives/hub'
import { readMemberModeration } from '@/core/services/lives/MemberModerationService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the signed-in member moderation figures', tags: ['lives'] },
  handler: async ({ session }) => {
    const history = await readMemberModeration(session.id)

    return historyFiguresOf(history?.lives ?? [])
  },
})
