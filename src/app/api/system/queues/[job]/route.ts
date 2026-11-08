import { forbidden, notFound } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { retryFailedJobs } from '@/core/services/system/QueueReportService'
import { JOB_REGISTRY } from '@/declarations/system/jobs'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Retry the failed runs of one background job', tags: ['system'] },
  handler: async ({ params, session, access }) => {
    // System holders only
    if (!access.isSystem) throw forbidden()
    if (!JOB_REGISTRY.has(params.job)) throw notFound()

    await retryFailedJobs(params.job, session.id)

    return { retried: true }
  },
})
