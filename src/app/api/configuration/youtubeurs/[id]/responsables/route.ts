import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readAnchors, replaceAnchors } from '@/core/services/auth/LeadService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read submitted teams
 * @param {unknown} value - Raw map
 * @return {Record<string, string | null>} - Team per account
 */

const readTeams = (value: unknown): Record<string, string | null> => {
  if (typeof value !== 'object' || value === null) return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([accountId, teamId]) => [
      accountId,
      typeof teamId === 'string' && teamId.length > 0 ? teamId : null,
    ])
  )
}

export const GET = createProtectedRoute({
  permission: Permissions.ReferenceRead,
  descriptor: { summary: 'Read the responsables anchored on a creator', tags: ['reference'] },
  handler: ({ params }) => readAnchors(params.id),
})

export const PUT = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Replace the responsables anchored on a creator', tags: ['reference'] },
  handler: async ({ params, raw, session, access }) => {
    // An anchor is what a whole perimeter is read from, so only an admin writes one
    if (!access.isAdmin) throw forbidden()

    const accountIds = Array.isArray(raw.accountIds) ? raw.accountIds.map(String) : []
    const anchors = await replaceAnchors(params.id, accountIds, readTeams(raw.teams))

    await recordEvent({
      eventType: 'LeadsAnchored',
      actorId: session.id,
      targetType: 'youtuber',
      targetId: params.id,
      summary: String(anchors.length),
    })

    return anchors
  },
})
