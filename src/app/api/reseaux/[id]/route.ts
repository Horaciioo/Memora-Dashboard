import { createProtectedRoute } from '@/core/lib/http/route'
import {
  SOCIAL_FIELDS,
  assertSocialAccess,
  removeSocial,
  socialOwner,
  updateSocial,
} from '@/core/services/members/MemberFileService'

export const PATCH = createProtectedRoute({
  fields: SOCIAL_FIELDS,
  descriptor: { summary: 'Edit a social profile', tags: ['members'] },
  handler: async ({ params, body, session, access }) => {
    assertSocialAccess(await socialOwner(params.id), session.id, access)

    return updateSocial(params.id, body)
  },
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Drop a social profile', tags: ['members'] },
  handler: async ({ params, session, access }) => {
    assertSocialAccess(await socialOwner(params.id), session.id, access)
    await removeSocial(params.id)

    return { id: params.id }
  },
})
