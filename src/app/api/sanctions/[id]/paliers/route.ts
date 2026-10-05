import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { replaceLadder } from '@/core/services/sanctions/SanctionService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { SANCTION_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_GRAVITY_REGISTRY } from '@/declarations/sanctions/registries'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { SanctionRungInput } from '@/types/sanctions'
import type { SanctionGravityName } from '@/utils/constants/moderation'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read the ordered steps
 * @param {unknown} raw - Body entry
 * @return {SanctionRungInput[]} - Steps
 */

const readSteps = (raw: unknown): SanctionRungInput[] => {
  if (!Array.isArray(raw)) throw invalidInput([{ field: 'steps', message: FORM_COPY.required }])
  if (raw.length > SANCTION_SETTINGS.maxSteps) {
    throw invalidInput([{ field: 'steps', message: FORM_COPY.tooLong }])
  }

  return raw.map((entry) => {
    const step = entry as { condition?: unknown; measureIds?: unknown }
    const measureIds = Array.isArray(step.measureIds)
      ? step.measureIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : []
    if (measureIds.length === 0) {
      throw invalidInput([{ field: 'measureIds', message: FORM_COPY.required }])
    }

    return {
      condition: typeof step.condition === 'string' && step.condition ? step.condition : null,
      measureIds,
    }
  })
}

export const PUT = createProtectedRoute({
  permission: Permissions.SanctionManage,
  descriptor: { summary: 'Replace the ladder of an offence at one level', tags: ['sanctions'] },
  handler: async ({ params, raw, session, scope }) => {
    const levelId = typeof raw.levelId === 'string' ? raw.levelId : ''
    if (!levelId) throw invalidInput([{ field: 'levelId', message: FORM_COPY.required }])

    const gravity = typeof raw.gravity === 'string' ? raw.gravity : ''
    if (!SANCTION_GRAVITY_REGISTRY.has(gravity)) {
      throw invalidInput([{ field: 'gravity', message: FORM_COPY.required }])
    }

    const offense = await replaceLadder(
      await scope(),
      params.id,
      levelId,
      gravity as SanctionGravityName,
      readSteps(raw.steps)
    )

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
