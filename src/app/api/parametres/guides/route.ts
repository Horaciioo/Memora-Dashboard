import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { markGuideSeen } from '@/core/services/preferences/GuideService'
import { GUIDE_KEYS } from '@/declarations/academy/welcome'
import type { GuideKey } from '@/declarations/academy/welcome'
import { FORM_COPY } from '@/declarations/ui/copy/forms'

// Keys a member may mark as seen, a started live included
const KNOWN = new Set<string>(Object.values(GUIDE_KEYS))
const LIVE_STARTED = /^live-started:[a-z0-9-]{1,40}$/

// Whether a key names a guide
const isGuideKey = (key: string): boolean => KNOWN.has(key) || LIVE_STARTED.test(key)

export const POST = createProtectedRoute({
  descriptor: { summary: 'Mark a one-time guide as seen', tags: ['preferences'] },
  handler: async ({ raw, session }) => {
    const key = typeof raw.key === 'string' ? raw.key : ''
    if (!isGuideKey(key)) throw invalidInput([{ field: 'key', message: FORM_COPY.notAnOption }])

    await markGuideSeen(session.id, key as GuideKey)

    return { key }
  },
})
