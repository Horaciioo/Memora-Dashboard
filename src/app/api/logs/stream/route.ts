import { forbidden } from '@/core/lib/errors'
import { createStreamRoute } from '@/core/lib/http/route'
import { liveStreamOf } from '@/core/lib/lives/stream'
import { JOURNAL_SIGNAL } from '@/declarations/system/signals'

// Event alone, nothing from the journal crosses it
const openStream = liveStreamOf(() => `event: ${JOURNAL_SIGNAL.event}\ndata: {}\n\n`)

export const GET = createStreamRoute({
  rateLimit: false,
  descriptor: { summary: 'Hear when the logs grow', tags: ['system'] },
  open: async ({ request, access }) => {
    if (!access.isSystem) throw forbidden()

    return openStream(request, JOURNAL_SIGNAL.topic)
  },
})
