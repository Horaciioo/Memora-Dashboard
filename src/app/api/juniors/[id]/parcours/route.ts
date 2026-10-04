import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { juniorAccount } from '@/core/services/academy/AcademyService'
import { declareKickoff, readParkour, resignJunior } from '@/core/services/academy/ParkourService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AcademyRead,
  descriptor: { summary: 'Read where a junior stands on the AcademicParkour', tags: ['academy'] },
  handler: async ({ params, session, access }) =>
    readParkour(params.id, academyScope(session, access)),
})

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: {
    summary: 'Declare the PIM start of a junior, or record their resignation',
    tags: ['academy'],
  },
  handler: async ({ params, raw, session, access }) => {
    const scope = academyScope(session, access)
    const { accountId } = await juniorAccount(params.id, scope)

    if (raw.action === 'kickoff') {
      await declareKickoff(params.id, scope)
      await recordEvent({
        eventType: 'ParkourMoved',
        actorId: session.id,
        subjectId: accountId,
        targetType: 'junior',
        targetId: params.id,
        summary: PARKOUR_COPY.kickoffDeclared,
      })
    } else if (raw.action === 'resign') {
      await resignJunior(params.id, scope, session.id)
      await recordEvent({
        eventType: 'ParkourMoved',
        actorId: session.id,
        subjectId: accountId,
        targetType: 'junior',
        targetId: params.id,
        summary: PARKOUR_COPY.resigned,
      })
    } else {
      throw invalidInput([{ field: 'action', message: FORM_COPY.notAnOption }])
    }

    return readParkour(params.id, scope)
  },
})
