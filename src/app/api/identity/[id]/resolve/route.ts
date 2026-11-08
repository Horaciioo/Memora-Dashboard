import { createProtectedRoute } from '@/core/lib/http/route'
import { resolveCheck } from '@/core/services/identity'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { FieldDefinition } from '@/types/forms'
import { Permissions } from '@/utils/constants/permissions'

// Identifier and application the responsable confirmed
const RESOLVE_FIELDS: FieldDefinition[] = [
  {
    name: 'discordId',
    kind: 'text',
    label: 'discordId',
    required: true,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
  {
    name: 'candidateId',
    kind: 'text',
    label: 'candidateId',
    required: true,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
]

export const POST = createProtectedRoute({
  permission: Permissions.IntegrationManage,
  fields: RESOLVE_FIELDS,
  descriptor: {
    summary: 'Give the right identifier and hand out its single link',
    tags: ['identity'],
  },
  handler: async ({ params, body, session }) => {
    const path = await resolveCheck(
      params.id,
      { discordId: String(body.discordId ?? ''), candidateId: String(body.candidateId ?? '') },
      session
    )

    return { path }
  },
})
