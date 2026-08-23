import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  memberFields,
  readMember,
  removeMember,
  updateMember,
} from '@/core/services/members/MemberService'
import { recordEvent } from '@/core/services/system/ActivityService'
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
    const parsed = parseFormValues(await memberFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const member = await updateMember(params.id, parsed.values)

    await recordEvent({
      eventType: 'MemberUpdated',
      actorId: session.id,
      subjectId: member.id,
      targetType: 'member',
      targetId: member.id,
      summary: member.displayName,
    })

    return member
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.MemberDelete,
  descriptor: { summary: 'Drop a moderator', tags: ['members'] },
  handler: async ({ params, session }) => {
    const member = await readMember(params.id)
    await removeMember(params.id)

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
