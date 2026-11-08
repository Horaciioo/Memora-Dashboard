import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { announceSession } from '@/core/services/work/AnnouncementService'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { FieldDefinition } from '@/types/forms'
import { Permissions } from '@/utils/constants/permissions'

// Wording as posted
const FIELDS: FieldDefinition[] = [
  {
    name: 'announcement',
    kind: 'markdown',
    label: 'Annonce',
    required: true,
    maxLength: FORM_SETTINGS.markdownMaxLength,
  },
]

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Record the Discord announcement of a session', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) => {
    const parsed = parseFormValues(FIELDS, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return announceSession(params.id, parsed.values, await scope())
  },
})
