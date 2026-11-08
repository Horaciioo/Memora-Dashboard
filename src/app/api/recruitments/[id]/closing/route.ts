import { createProtectedRoute } from '@/core/lib/http/route'
import { signalSession } from '@/core/lib/recruitment/signal'
import { closeSession } from '@/core/services/recruitment'
import { afterRecruitmentClosed } from '@/core/services/academy/parkour/ParkourService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { JOURNAL_FILES } from '@/core/services/system/FileJournal'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: {
    summary: 'Close a recruitment session and admit its accepted',
    tags: ['recruitment'],
  },
  handler: async ({ params, session, scope }) => {
    const closed = await closeSession(params.id, await scope())

    await recordEvent({
      eventType: 'RecruitmentClosed',
      actorId: session.id,
      targetType: JOURNAL_FILES.Recruitment,
      targetId: closed.id,
      summary: closed.name,
    })
    await afterRecruitmentClosed(closed.id)
    await signalSession(params.id)

    return closed
  },
})
