import { createStreamRoute } from '@/core/lib/http/route'
import { liveStreamOf } from '@/core/lib/lives/stream'
import { ACCESS_SIGNAL } from '@/declarations/access/signal'

// Event alone, nothing private crosses it
const openStream = liveStreamOf(() => `event: ${ACCESS_SIGNAL.event}\ndata: {}\n\n`)

export const GET = createStreamRoute({
  rateLimit: false,
  descriptor: { summary: 'Hear when access rights change', tags: ['access'] },
  open: async ({ request }) => openStream(request, ACCESS_SIGNAL.topic),
})
