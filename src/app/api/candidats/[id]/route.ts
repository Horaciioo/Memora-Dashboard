import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  candidateFields,
  candidateSession,
  removeCandidate,
  updateCandidate,
} from '@/core/services/recruitment/RecruitmentService'
import { notify } from '@/core/services/system/NotificationService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Edit a candidate', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const perimeter = await scope()
    const parsed = parseFormValues(await candidateFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const candidate = await updateCandidate(params.id, parsed.values, perimeter)

    await notify({
      kind: 'CandidateAssigned',
      recipients: [candidate.recruiter?.id],
      actorId: session.id,
      target: 'recruitment',
      targetId: await candidateSession(params.id, perimeter),
      subject: candidate.memberName ?? candidate.discordId,
      once: true,
    })

    return candidate
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Drop a candidate', tags: ['recruitment'] },
  handler: async ({ params, scope }) => removeCandidate(params.id, await scope()),
})
