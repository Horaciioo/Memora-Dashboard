import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope, assertJuniorViewer } from '@/core/services/academy/AcademyScope'
import {
  juniorAccount,
  listJuniorSkills,
  setJuniorSkill,
} from '@/core/services/academy/AcademyService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { notify } from '@/core/services/system/NotificationService'
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
  handler: async ({ params, raw, session, access }) => {
    const skillId = String(raw.skillId ?? '')
    if (!skillId) throw invalidInput([{ field: 'skillId', message: FORM_COPY.required }])

    const scope = academyScope(session, access)
    const [skill, account, skills] = await Promise.all([
      prisma.skill.findUnique({ where: { id: skillId } }),
      juniorAccount(params.id, scope),
      setJuniorSkill(params.id, scope, skillId, Number(raw.percent ?? 0), session.id),
    ])

    await recordEvent({
      eventType: 'SkillUpdated',
      actorId: session.id,
      subjectId: account.accountId,
      targetType: 'skill',
      targetId: skillId,
      summary: skill?.name ?? skillId,
    })

    await notify({
      kind: 'SkillGraded',
      recipients: [account.accountId],
      actorId: session.id,
      target: 'training',
      subject: skill?.name ?? null,
    })

    return skills
  },
})
