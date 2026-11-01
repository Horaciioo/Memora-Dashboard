import { createProtectedRoute } from '@/core/lib/http/route'
import { readPushSettings, setMutedCategories } from '@/core/services/push'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read my push families and devices', tags: ['push'] },
  handler: async ({ session }) => readPushSettings(session.id),
})

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Silence some push families', tags: ['push'] },
  handler: async ({ raw, session }) => {
    const muted = Array.isArray(raw.muted)
      ? raw.muted.filter((name): name is string => typeof name === 'string')
      : []

    return { muted: await setMutedCategories(session.id, muted) }
  },
})
