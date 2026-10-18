import { createProtectedRoute } from '@/core/lib/http/route'
import { recordEvent } from '@/core/services/system/ActivityService'
import { buildPersonalExport } from '@/core/services/system/PortabilityService'

export const GET = createProtectedRoute({
  rateLimit: 'export',
  descriptor: { summary: 'Download my personal data', tags: ['preferences'] },
  handler: async ({ session }) => {
    await recordEvent({
      eventType: 'DataExported',
      actorId: session.id,
      subjectId: session.id,
      summary: 'Export des données personnelles',
    })

    return buildPersonalExport(session.id)
  },
})
