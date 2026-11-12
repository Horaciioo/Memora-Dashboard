import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readClientErrors } from '@/core/lib/nexus/observe/clientErrors'
import { recordError } from '@/core/services/system/ErrorEventService'

export const POST = createProtectedRoute({
  rateLimit: 'clientErrors',
  handler: async ({ raw, session, request }) => {
    const reports = readClientErrors(raw, Number(request.headers.get('content-length') ?? 0))
    if (!reports) throw invalidInput([{ field: 'errors', message: 'Rapport illisible' }])

    // Browser reports are warnings, nothing there is trusted
    for (const report of reports) {
      await recordError({
        severity: 'WARNING',
        source: 'CLIENT',
        message: report.message,
        stack: report.stack,
        route: report.path,
        accountId: session.id,
        context: { userAgentFamily: request.headers.get('user-agent')?.slice(0, 80) ?? null },
      })
    }

    return { received: reports.length }
  },
})
