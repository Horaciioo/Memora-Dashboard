import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { juniorFields, removeJunior, updateJunior } from '@/core/services/academy/AcademyService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ACADEMY_JUNIOR_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Edit the follow-up of a junior', tags: ['academy'] },
  handler: async ({ params, raw, session, access }) => {
    const junior = await prisma.academyJunior.findUnique({
      where: { id: params.id },
      include: { account: true },
    })
    if (!junior) throw notFound()

    const parsed = parseFormValues(await juniorFields(junior.sessionId), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const juniors = await updateJunior(params.id, academyScope(session, access), parsed.values)

    // Only a real transition is journalled, a plain re-save is not a step forward
    const next = juniors.find((entry) => entry.id === params.id)
    if (next && next.status !== junior.status) {
      await recordEvent({
        eventType: 'AcademyAdvanced',
        actorId: session.id,
        subjectId: junior.accountId,
        targetType: 'junior',
        targetId: params.id,
        summary: `${junior.account.displayName} · ${ACADEMY_JUNIOR_STATUS_REGISTRY.label(next.status)}`,
      })
    }

    return juniors
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Take a junior out of a session', tags: ['academy'] },
  handler: ({ params, session, access }) => removeJunior(params.id, academyScope(session, access)),
})
