import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  anonymiseMember,
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
  handler: async ({ params, raw, session }) => {
    const fields = await memberFields()

    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const before = await readMember(params.id)
    const member = await updateMember(params.id, parsed.values)

    await recordEvent({
      eventType: 'MemberUpdated',
      actorId: session.id,
      subjectId: member.id,
      targetType: 'member',
      targetId: member.id,
      summary: member.displayName,
      change: summariseChange(fields, before.values, parsed.values),
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
