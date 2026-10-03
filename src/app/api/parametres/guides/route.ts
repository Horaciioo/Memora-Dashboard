import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { markGuideSeen } from '@/core/services/preferences/GuideService'
import { GUIDE_KEYS } from '@/declarations/academy/welcome'
import type { GuideKey } from '@/declarations/academy/welcome'
import { FORM_COPY } from '@/declarations/ui/copy/forms'

// Keys a member may mark as seen
const KNOWN = new Set<string>(Object.values(GUIDE_KEYS))

export const POST = createProtectedRoute({
  descriptor: { summary: 'Mark a one-time guide as seen', tags: ['preferences'] },
  handler: async ({ raw, session }) => {
    const key = typeof raw.key === 'string' ? raw.key : ''
    if (!KNOWN.has(key)) throw invalidInput([{ field: 'key', message: FORM_COPY.notAnOption }])

    await markGuideSeen(session.id, key as GuideKey)

    return { key }
  },
})
