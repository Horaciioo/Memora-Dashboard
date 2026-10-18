import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { assertWritable, moveAnnouncement } from '@/core/services/work/AnnouncementService'
import { workViewer } from '@/core/services/work/visibility'
import { COMMUNICATION_STATUSES } from '@/declarations/work/announcements'
import { Permissions } from '@/utils/constants/permissions'
import type { CommunicationStatus } from '@prisma/client'

export const PATCH = createProtectedRoute({
  permission: Permissions.CommunicationWrite,
  descriptor: { summary: 'Move an announcement to another status', tags: ['projects'] },
  handler: async ({ params, raw, session, access }) => {
    await assertWritable(params.id, workViewer(session, access))

    const status = typeof raw.columnId === 'string' ? raw.columnId : ''
    if (!(status in COMMUNICATION_STATUSES)) {
      throw invalidInput([{ field: 'columnId', message: 'Statut inconnu' }])
    }

    return moveAnnouncement(params.id, status as CommunicationStatus)
  },
})
