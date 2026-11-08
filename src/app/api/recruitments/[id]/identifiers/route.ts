import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  addSessionIdentifier,
  identifierFields,
} from '@/core/services/recruitment/IdentifierService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  status: 201,
  descriptor: {
    summary: 'Store a Discord identifier met in an announcement',
    tags: ['recruitment'],
  },
  handler: async ({ params, raw, scope }) => {
    const parsed = parseFormValues(identifierFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return addSessionIdentifier(params.id, parsed.values, await scope())
  },
})
