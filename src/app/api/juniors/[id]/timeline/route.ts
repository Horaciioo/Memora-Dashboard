import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope, assertJuniorViewer } from '@/core/services/academy/AcademyScope'
import { juniorAccount } from '@/core/services/academy/AcademyService'
import { advanceTimeline, readTimeline } from '@/core/services/academy/PimTimelineService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: [Permissions.AcademyRead, Permissions.AcademySelfRead],
  descriptor: { summary: 'Read the vertical timeline of a junior', tags: ['academy'] },
  handler: async ({ params, session, access }) => {
    const scope = academyScope(session, access)
    assertJuniorViewer(session, access, await juniorAccount(params.id, scope))

    return readTimeline(params.id, scope)
  },
})

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Move a junior to the next timeline step', tags: ['academy'] },
  handler: async ({ params, session, access }) => {
    const scope = academyScope(session, access)
    const [account, timeline] = await Promise.all([
      juniorAccount(params.id, scope),
      advanceTimeline(params.id, scope, session.id),
    ])

    const passed = timeline.steps.filter((step) => step.position === 'done').at(-1)

    await recordEvent({
      eventType: 'StepValidated',
      actorId: session.id,
      subjectId: account.accountId,
      targetType: 'junior',
      targetId: params.id,
      summary: passed?.title ?? params.id,
    })

    return timeline
  },
})
