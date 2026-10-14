import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { openSecondPeriodAnyway } from '@/core/services/academy/ParkourService'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Open the second period of a PIM session', tags: ['academy'] },
  handler: async ({ params, session, access }) => {
    await openSecondPeriodAnyway(params.id, academyScope(session, access), session.id)
    await recordFileEvent({
      eventType: 'AcademyAdvanced',
      file: JOURNAL_FILES.Academy,
      fileId: params.id,
      actorId: session.id,
      summary: PARKOUR_COPY.secondPeriodOpened,
    })

    return { id: params.id }
  },
})
