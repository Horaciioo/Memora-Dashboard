import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { signalSession } from '@/core/lib/recruitment/signal'
import { proseFields, saveInstructions } from '@/core/services/recruitment'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  permission: Permissions.RecruitmentInstructionWrite,
  descriptor: { summary: 'Write the consignes of a session', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) => {
    const parsed = parseFormValues(proseFields('instructions'), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const saved = await saveInstructions(params.id, parsed.values, await scope())
    await signalSession(params.id)

    return saved
  },
})
