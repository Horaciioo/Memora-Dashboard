import { createProtectedRoute } from '@/core/lib/http/route'
import {
  discardDraft,
  readActive,
  readDraft,
  saveDraft,
} from '@/core/services/unban/UnbanFormService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.UnbanManage,
  descriptor: { summary: 'Read the active Deban. form and its draft', tags: ['unban'] },
  handler: async ({ access }) => ({ active: await readActive(), draft: await readDraft(access) }),
})

export const PUT = createProtectedRoute({
  permission: Permissions.UnbanManage,
  descriptor: { summary: 'Save the draft of the Deban. form', tags: ['unban'] },
  handler: async ({ access, raw }) => saveDraft(access, raw),
})

export const DELETE = createProtectedRoute({
  permission: Permissions.UnbanManage,
  descriptor: { summary: 'Discard the draft of the Deban. form', tags: ['unban'] },
  handler: async ({ access }) => {
    await discardDraft(access)

    return { discarded: true }
  },
})
