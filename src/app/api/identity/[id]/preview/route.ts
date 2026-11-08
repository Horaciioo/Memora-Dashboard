import { createProtectedRoute } from '@/core/lib/http/route'
import { previewIdentity } from '@/core/services/identity'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { FieldDefinition } from '@/types/forms'
import { Permissions } from '@/utils/constants/permissions'

// Identifier the responsable typed
const PREVIEW_FIELDS: FieldDefinition[] = [
  {
    name: 'discordId',
    kind: 'text',
    label: 'discordId',
    required: true,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
]

export const POST = createProtectedRoute({
  permission: Permissions.IntegrationManage,
  fields: PREVIEW_FIELDS,
  descriptor: { summary: 'Show the identity behind a typed identifier', tags: ['identity'] },
  handler: async ({ params, body, session }) =>
    previewIdentity(params.id, String(body.discordId ?? ''), session),
})
