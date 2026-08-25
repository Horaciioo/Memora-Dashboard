import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { replaceLadder } from '@/core/services/sanctions/SanctionService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { SANCTION_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'
import type { LadderStepInput } from '@/core/services/sanctions/SanctionService'

// The ladder arrives as an ordered list, its index becoming the rung
const readSteps = (raw: unknown): LadderStepInput[] => {
  if (!Array.isArray(raw)) throw invalidInput([{ field: 'steps', message: FORM_COPY.required }])
  if (raw.length > SANCTION_SETTINGS.maxSteps) {
    throw invalidInput([{ field: 'steps', message: FORM_COPY.tooLong }])
  }

  return raw.map((entry) => {
    const step = entry as { measureId?: unknown; note?: unknown }
    const measureId = typeof step.measureId === 'string' ? step.measureId : ''
    if (!measureId) throw invalidInput([{ field: 'measureId', message: FORM_COPY.required }])

    return { measureId, note: typeof step.note === 'string' && step.note ? step.note : null }
  })
}

export const PUT = createProtectedRoute({
  permission: Permissions.SanctionManage,
  descriptor: { summary: 'Replace the ladder of an offence', tags: ['sanctions'] },
  handler: async ({ params, raw, session, scope }) => {
    const levelId = typeof raw.levelId === 'string' ? raw.levelId : ''
    if (!levelId) throw invalidInput([{ field: 'levelId', message: FORM_COPY.required }])

    const offense = await replaceLadder(await scope(), params.id, levelId, readSteps(raw.steps))

    await recordEvent({
      eventType: 'SanctionChanged',
      actorId: session.id,
      targetType: 'sanctions',
      targetId: offense.id,
      summary: offense.name,
    })

    return offense
  },
})
