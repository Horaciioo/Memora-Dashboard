import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import {
  stepFields,
  removeStep,
  setStepDone,
  updateStep,
} from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Edit a moment or flip it to held', tags: ['academy'] },
  handler: async ({ params, raw, session, access }) => {
    const scope = academyScope(session, access)

    // A lone done flag only toggles the moment, it never rewrites it
    if (typeof raw.done === 'boolean') return setStepDone(params.id, scope, raw.done)

    const event = await prisma.academyStep.findUnique({ where: { id: params.id } })
    if (!event) throw notFound()

    const parsed = parseFormValues(await stepFields(event.sessionId), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateStep(params.id, scope, parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Drop a moment', tags: ['academy'] },
  handler: ({ params, session, access }) => removeStep(params.id, academyScope(session, access)),
})
