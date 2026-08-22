import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { replaceSocials, socialFields } from '@/core/services/members/MemberFileService'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  permission: Permissions.MemberUpdate,
  descriptor: { summary: 'Replace the social profiles', tags: ['members'] },
  handler: async ({ params, raw }) => {
    const parsed = parseFormValues(await socialFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return replaceSocials(params.id, parsed.values)
  },
})
