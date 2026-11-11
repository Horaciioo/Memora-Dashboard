import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import {
  readSession,
  removeSession,
  sessionFields,
  updateSession,
} from '@/core/services/academy/AcademyService'
import { announceLaunch } from '@/core/services/academy/parkour/ParkourService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { summariseChange } from '@/core/services/system/changes'
import { JOURNAL_FILES } from '@/core/services/system/FileJournal'
import { sessionTitle } from '@/utils/format/academy'
import { AcademySessionStatuses } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Edit an academy session', tags: ['academy'] },
  handler: async ({ params, raw, session, access }) => {
    const scope = academyScope(session, access)
    const before = await readSession(params.id, scope)
    const fields = await sessionFields(undefined, before.summary.values.referentIds as string[])
    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)
    const sessions = await updateSession(params.id, scope, parsed.values)
    const after = sessions.find((entry) => entry.id === params.id)

    await recordEvent({
      eventType: 'AcademyEdited',
      actorId: session.id,
      targetType: JOURNAL_FILES.Academy,
      targetId: params.id,
      summary: sessionTitle(before.summary),
      change: after ? summariseChange(fields, before.summary.values, after.values) : null,
    })

    if (
      after?.status === AcademySessionStatuses.Running &&
      before.summary.status !== after.status
    ) {
      await announceLaunch(params.id, session.id)
    }

    return sessions
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Drop an academy session', tags: ['academy'] },
  handler: ({ params, session, access }) => removeSession(params.id, academyScope(session, access)),
})
