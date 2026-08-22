import { createProtectedRoute } from '@/core/lib/http/route'
import { readOverrides, replaceOverrides } from '@/core/services/members/MemberFileService'
import type { MemberOverride } from '@/core/services/members/MemberFileService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Read the permission overrides', tags: ['access'] },
  handler: ({ params }) => readOverrides(params.id),
})

export const PUT = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Replace the permission overrides', tags: ['access'] },
  handler: async ({ params, raw, session }) => {
    const overrides = Array.isArray(raw.overrides) ? (raw.overrides as MemberOverride[]) : []
    const stored = await replaceOverrides(params.id, overrides)

    await recordEvent({
      eventType: 'PermissionChanged',
      actorId: session.id,
      subjectId: params.id,
      targetType: 'member',
      targetId: params.id,
      summary: String(stored.length),
    })

    return stored
  },
})
