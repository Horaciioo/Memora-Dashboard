import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  profileFields,
  readProfile,
  updateProfile,
} from '@/core/services/preferences/ProfileService'
import { recordEvent } from '@/core/services/system/ActivityService'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read my own file', tags: ['preferences'] },
  handler: ({ session }) => readProfile(session.id),
})

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Edit my own file', tags: ['preferences'] },
  handler: async ({ raw, session }) => {
    const parsed = parseFormValues(profileFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const profile = await updateProfile(session.id, parsed.values)

    await recordEvent({
      eventType: 'MemberUpdated',
      actorId: session.id,
      subjectId: session.id,
      targetType: 'member',
      targetId: session.id,
      summary: profile.displayName,
    })

    return profile
  },
})
