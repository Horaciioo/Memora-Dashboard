import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { removeAcademyComment } from '@/core/services/academy/juniors/CommentService'
import { Permissions } from '@/utils/constants/permissions'

export const DELETE = createProtectedRoute({
  permission: Permissions.AcademyNoteWrite,
  descriptor: { summary: 'Drop a remark left on a junior or a promotion', tags: ['academy'] },
  handler: ({ params, session, access }) =>
    removeAcademyComment(params.id, academyScope(session, access)),
})
