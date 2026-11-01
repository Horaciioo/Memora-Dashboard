import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { followTrainer } from '@/core/services/academy/FollowUpService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AcademyRead,
  descriptor: { summary: 'Read where a trainer stands with their juniors', tags: ['academy'] },
  handler: async ({ query, session, access }) => {
    const canFollow = access.isResponsable || access.isAdmin
    const trainerId = query.get('formateur') ?? session.id

    // Another trainer's file is read by a responsable only
    if (trainerId !== session.id && !canFollow) throw forbidden()

    return {
      canFollow,
      juniors: await followTrainer(
        trainerId,
        academyScope(session, access),
        query.get('junior') ?? undefined
      ),
    }
  },
})
