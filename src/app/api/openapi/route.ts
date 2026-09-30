import { buildOpenApiDocument } from '@/core/lib/http/openapi/collector'
import { createProtectedRoute } from '@/core/lib/http/route'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Serve the OpenAPI document', tags: ['system'] },
  handler: async () => buildOpenApiDocument(),
})
