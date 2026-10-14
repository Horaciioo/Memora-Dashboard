import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { launchAnyway } from '@/core/services/academy/ParkourService'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: {
    summary: 'Launch a PIM session, the juniors still on their form following later',
    tags: ['academy'],
  },
  handler: async ({ params, session, access }) => {
    await launchAnyway(params.id, academyScope(session, access), session.id)
    await recordFileEvent({
      eventType: 'AcademyLaunched',
      file: JOURNAL_FILES.Academy,
      fileId: params.id,
      actorId: session.id,
      summary: ACADEMY_COPY.launched,
    })

    return { id: params.id }
  },
})
