import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { assertUnsealed, readLayer, readOverwrites } from '@/core/services/auth/AccessGuard'
import { readOverrides, replaceOverrides } from '@/core/services/members/MemberFileService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { notify } from '@/core/services/system/NotificationService'
import { ACCESS_EDITABLE } from '@/declarations/access/editing'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Read the permission overrides', tags: ['access'] },
  handler: ({ params }) => readOverrides(params.id),
})

export const PUT = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Replace the permission overrides', tags: ['access'] },
  handler: async ({ params, raw, session, access }) => {
    // Decided in code for now
    if (!ACCESS_EDITABLE) throw forbidden()

    await assertUnsealed(access)

    const youtuberId = readLayer(raw)
    const stored = await replaceOverrides(params.id, readOverwrites(raw.overrides), youtuberId)

    await recordEvent({
      eventType: 'PermissionChanged',
      actorId: session.id,
      subjectId: params.id,
      targetType: 'member',
      targetId: params.id,
      summary: String(Object.values(stored).flat().length),
    })

    await notify({
      kind: 'AccessChanged',
      recipients: [params.id],
      actorId: session.id,
      target: 'member',
      targetId: params.id,
    })

    return stored
  },
})
