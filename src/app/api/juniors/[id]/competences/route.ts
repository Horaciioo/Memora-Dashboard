import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope, assertJuniorViewer } from '@/core/services/academy/AcademyScope'
import {
  juniorAccount,
  listJuniorSkills,
  setJuniorSkill,
} from '@/core/services/academy/AcademyService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: [Permissions.AcademyRead, Permissions.AcademySelfRead],
  descriptor: { summary: 'Read the competency grades of a junior', tags: ['academy'] },
  handler: async ({ params, session, access }) => {
    const scope = academyScope(session, access)
    assertJuniorViewer(session, access, await juniorAccount(params.id, scope))

    return listJuniorSkills(params.id, scope)
  },
})

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademySkillWrite,
  descriptor: { summary: 'Move the mastery of one competency', tags: ['academy'] },
  handler: ({ params, raw, session, access }) => {
    const skillId = String(raw.skillId ?? '')
    if (!skillId) throw invalidInput([{ field: 'skillId', message: FORM_COPY.required }])

    return setJuniorSkill(
      params.id,
      academyScope(session, access),
      skillId,
      Number(raw.percent ?? 0),
      session.id
    )
  },
})
