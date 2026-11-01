import { systemFailure } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { samplePushPayload } from '@/core/lib/push'
import { sendTestPush } from '@/core/services/push'

// Kind of the settings trial
const TRIAL_KIND = 'PushTrial'

export const POST = createProtectedRoute({
  rateLimit: 'lookup',
  descriptor: { summary: 'Send a trial push to my devices', tags: ['push'] },
  handler: async ({ session }) => {
    const payload = samplePushPayload(TRIAL_KIND, session.displayName)
    if (!payload) throw systemFailure()

    return { reached: await sendTestPush({ accountId: session.id, payload, kind: TRIAL_KIND }) }
  },
})
