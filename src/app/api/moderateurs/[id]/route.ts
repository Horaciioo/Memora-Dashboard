import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readSealState, sealValues } from '@/core/services/auth/SealService'
import {
  anonymiseMember,
  assertDivisionAssignable,
  memberFields,
  readMember,
  updateMember,
} from '@/core/services/members/MemberService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { summariseChange } from '@/core/services/system/changes'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.MemberRead,
  descriptor: { summary: 'Read a moderator file', tags: ['members'] },
  handler: ({ params, access }) => readMember(params.id, access.can(Permissions.MemberNoteRead)),
})

export const PATCH = createProtectedRoute({
  permission: Permissions.MemberUpdate,
  descriptor: { summary: 'Edit a moderator', tags: ['members'] },
  handler: async ({ params, raw, session, access }) => {
    const fields = await memberFields(access.isAdmin)

    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const [before, { isUnsealed }] = await Promise.all([readMember(params.id), readSealState()])

    await assertDivisionAssignable(
      parsed.values,
      access.isAdmin,
      before.summary.division?.id ?? null
    )

    const member = await updateMember(params.id, parsed.values)

    await recordEvent({
      eventType: 'MemberUpdated',
      actorId: session.id,
      subjectId: member.id,
      targetType: 'member',
      targetId: member.id,
      summary: member.displayName,
      change: summariseChange(
        fields,
        sealValues(before.values, isUnsealed),
        sealValues(parsed.values, isUnsealed)
      ),
    })

    return member
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.MemberDelete,
  descriptor: { summary: 'Close a moderator access', tags: ['members'] },
  handler: async ({ params, session }) => {
    const member = await readMember(params.id)
    await anonymiseMember(params.id)

    await recordEvent({
      eventType: 'MemberDeleted',
      actorId: session.id,
      targetType: 'member',
      targetId: params.id,
      summary: member.summary.displayName,
    })

    return { id: params.id }
  },
})
