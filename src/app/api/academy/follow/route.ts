import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { followReferent } from '@/core/services/academy/FollowUpService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AcademyRead,
  descriptor: { summary: 'Read where a referent stands with their juniors', tags: ['academy'] },
  handler: async ({ query, session, access }) => {
    const canFollow = access.isResponsable || access.isAdmin
    const referentId = query.get('referent') ?? session.id

    // Another referent's file is read by a responsable only
    if (referentId !== session.id && !canFollow) throw forbidden()

    return {
      canFollow,
      juniors: await followReferent(
        referentId,
        academyScope(session, access),
        query.get('junior') ?? undefined
      ),
    }
  },
})
