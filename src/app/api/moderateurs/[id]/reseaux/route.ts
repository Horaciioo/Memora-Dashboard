import { createProtectedRoute } from '@/core/lib/http/route'
import {
  SOCIAL_FIELDS,
  addSocial,
  assertSocialAccess,
} from '@/core/services/members/MemberFileService'

export const POST = createProtectedRoute({
  status: 201,
  fields: SOCIAL_FIELDS,
  descriptor: { summary: 'Add a social profile', tags: ['members'] },
  handler: async ({ params, body, session, access }) => {
    assertSocialAccess(params.id, session.id, access)

    return addSocial(params.id, body)
  },
})
