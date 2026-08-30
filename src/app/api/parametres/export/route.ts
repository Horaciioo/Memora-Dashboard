import { createProtectedRoute } from '@/core/lib/http/route'
import { buildPersonalExport } from '@/core/services/system/PortabilityService'

export const GET = createProtectedRoute({
  rateLimit: 'export',
  descriptor: { summary: 'Download my personal data', tags: ['preferences'] },
  handler: ({ session }) => buildPersonalExport(session.id),
})
