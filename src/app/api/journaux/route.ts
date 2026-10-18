import { createProtectedRoute } from '@/core/lib/http/route'
import { parseActivityFilters } from '@/core/lib/system/activityFilters'
import { readActivityExport } from '@/core/services/system/ActivityQueryService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AccessManage,
  rateLimit: 'export',
  descriptor: { summary: 'Export the journal entries matching the filters', tags: ['system'] },
  handler: async ({ query, session }) => {
    const entries = await readActivityExport(parseActivityFilters(query))

    // The export is itself a fact
    await recordEvent({
      eventType: 'DataExported',
      actorId: session.id,
      summary: `Export du journal, ${entries.length} entrées`,
    })

    return entries
  },
})
