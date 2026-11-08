import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { toJuniorEditFields } from '@/core/lib/academy/juniorForm'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { juniorFields, removeJunior, updateJunior } from '@/core/services/academy/AcademyService'
import { afterReferentAssigned } from '@/core/services/academy/parkour/ParkourService'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
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

    const parsed = parseFormValues(toJuniorEditFields(await juniorFields(junior.sessionId)), raw, {
      fillMissing: true,
    })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const juniors = await updateJunior(params.id, academyScope(session, access), parsed.values)

    // A last Référent may launch
    if (!junior.referentId && parsed.values.referentId)
      await afterReferentAssigned(junior.sessionId)

    return juniors
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Take a junior out of a session', tags: ['academy'] },
  handler: async ({ params, session, access }) => {
    const junior = await prisma.academyJunior.findUnique({
      where: { id: params.id },
      include: { account: true },
    })
    const juniors = await removeJunior(params.id, academyScope(session, access))

    if (junior) {
      await recordFileEvent({
        eventType: 'JuniorRemoved',
        file: JOURNAL_FILES.Academy,
        fileId: junior.sessionId,
        actorId: session.id,
        summary: junior.account.displayName,
      })
    }

    return juniors
  },
})
