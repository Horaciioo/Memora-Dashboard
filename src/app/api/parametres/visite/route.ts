import { createProtectedRoute } from '@/core/lib/http/route'
import { readProfile } from '@/core/services/preferences/ProfileService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { summariseChange } from '@/core/services/system/changes'
import { intakeFields, saveIntake } from '@/core/services/tour/IntakeService'

const FIELDS = intakeFields()

export const PATCH = createProtectedRoute({
  fields: FIELDS,
  partial: true,
  descriptor: { summary: 'Save the answers of the first visit', tags: ['preferences'] },
  handler: async ({ body, session }) => {
    const before = await readProfile(session.id)
    await saveIntake(session.id, body)
    const after = await readProfile(session.id)

    await recordEvent({
      eventType: 'MemberUpdated',
      actorId: session.id,
      subjectId: session.id,
      targetType: 'member',
      targetId: session.id,
      summary: after.displayName,
      change: summariseChange(FIELDS, before.values, after.values),
    })

    return { saved: true }
  },
})
