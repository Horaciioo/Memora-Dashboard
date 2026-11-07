import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readSealState, sealValues } from '@/core/services/auth/SealService'
import { clearVolunteeredDetails } from '@/core/services/members/MemberService'
import {
  profileFields,
  readProfile,
  updateProfile,
} from '@/core/services/preferences/ProfileService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { summariseChange } from '@/core/services/system/changes'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read my own file', tags: ['preferences'] },
  handler: ({ session }) => readProfile(session.id),
})

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Edit my own file', tags: ['preferences'] },
  handler: async ({ raw, session }) => {
    const fields = profileFields()

    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const [before, { isUnsealed }] = await Promise.all([readProfile(session.id), readSealState()])
    const profile = await updateProfile(session.id, parsed.values)

    await recordEvent({
      eventType: 'MemberUpdated',
      actorId: session.id,
      subjectId: session.id,
      targetType: 'member',
      targetId: session.id,
      summary: profile.displayName,
      change: summariseChange(
        fields,
        sealValues(before.values, isUnsealed),
        sealValues(profile.values, isUnsealed)
      ),
    })

    return profile
  },
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Erase the details I volunteered', tags: ['preferences'] },
  handler: async ({ session }) => {
    await clearVolunteeredDetails(session.id)

    await recordEvent({
      eventType: 'MemberUpdated',
      actorId: session.id,
      subjectId: session.id,
      targetType: 'member',
      targetId: session.id,
      summary: PREFERENCES_COPY.detailsErased,
    })

    return readProfile(session.id)
  },
})
