import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { decideTrack, readTrack } from '@/core/services/academy/LegacyService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { LegacyStatuses } from '@/utils/constants/hierarchy'
import type { LegacyStatusName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

// Outcomes a running track can be closed on
const DECISIONS: LegacyStatusName[] = [
  LegacyStatuses.Passed,
  LegacyStatuses.Failed,
  LegacyStatuses.Cancelled,
]

export const GET = createProtectedRoute({
  permission: Permissions.LegacyRead,
  descriptor: { summary: 'Read one Legacy track', tags: ['legacy'] },
  handler: async ({ params }) => readTrack(params.id),
})

export const PATCH = createProtectedRoute({
  permission: Permissions.LegacyManage,
  descriptor: { summary: 'Decide a Legacy track', tags: ['legacy'] },
  handler: async ({ params, raw, session, access }) => {
    // The role change is an administrator's call
    if (!access.isAdmin) throw forbidden()

    const decision = typeof raw.decision === 'string' ? raw.decision : ''
    if (!DECISIONS.includes(decision as LegacyStatusName)) {
      throw invalidInput([{ field: 'decision', message: FORM_COPY.required }])
    }

    return decideTrack(params.id, decision as LegacyStatusName, session.id)
  },
})
