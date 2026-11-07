import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readPushJournal } from '@/core/services/push'
import { PUSH_JOURNAL_CURSOR } from '@/declarations/pwa/push'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Read the push journal', tags: ['system'] },
  handler: async ({ query, access }) => {
    // System holders only
    if (!access.isSystem) throw forbidden()

    return readPushJournal(query.get(PUSH_JOURNAL_CURSOR) ?? undefined)
  },
})
