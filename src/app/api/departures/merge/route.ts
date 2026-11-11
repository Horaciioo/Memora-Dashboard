import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { mergeDepartures } from '@/core/services/members/admin'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Join departure announcements into one', tags: ['academy'] },
  handler: async ({ raw, session }) => {
    if (!Array.isArray(raw.ids) || !raw.ids.every((id) => typeof id === 'string')) {
      throw invalidInput([{ field: 'ids', message: FORM_COPY.notAnOption }])
    }

    return mergeDepartures(raw.ids as string[], session.id)
  },
})
