import { createStreamRoute } from '@/core/lib/http/route'
import { streamLogs } from '@/core/lib/nexus/observe/logStream'
import { requireNexus } from '@/core/wrappers/requireNexus'

export const GET = createStreamRoute({
  rateLimit: 'nexus',
  descriptor: { summary: 'Console log stream', tags: ['nexus'] },
  open: async (context) => {
    await requireNexus(context)
    const params = context.request.nextUrl.searchParams

    return streamLogs(context.request, {
      level: params.get('level') ?? undefined,
      grep: params.get('grep')?.slice(0, 100) ?? undefined,
    })
  },
})
