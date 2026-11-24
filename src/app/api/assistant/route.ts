import { createProtectedRoute } from '@/core/lib/http/route'
import { readAssistantRequest } from '@/core/lib/assistant/request'
import { interpret } from '@/core/services/assistant/AssistantService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.IntelligenceUse,
  rateLimit: 'search',
  descriptor: { summary: 'Read a sentence into a proposed action', tags: ['assistant'] },
  handler: ({ raw, session, access, scope }) =>
    interpret(readAssistantRequest(raw), { session, access, scope }),
})
