import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  createSession,
  listSessions,
  sessionFields,
} from '@/core/services/recruitment/RecruitmentService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { notify } from '@/core/services/system/NotificationService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.RecruitmentRead,
  descriptor: { summary: 'List the recruitment sessions in perimeter', tags: ['recruitment'] },
  handler: async ({ scope }) => listSessions(await scope()),
})

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  status: 201,
  descriptor: { summary: 'Open a recruitment session', tags: ['recruitment'] },
  handler: async ({ raw, session, scope }) => {
    const perimeter = await scope()
    const parsed = parseFormValues(await sessionFields(perimeter), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const created = await createSession(parsed.values, perimeter)

    await recordEvent({
      eventType: 'RecruitmentOpened',
      actorId: session.id,
      targetType: 'recruitment',
      targetId: created.id,
      summary: created.name,
    })

    await notify({
      kind: 'RecruitmentAssigned',
      recipients: created.responsables.map((person) => person.id),
      actorId: session.id,
      target: 'recruitment',
      targetId: created.id,
      subject: created.name,
    })

    return created
  },
})
