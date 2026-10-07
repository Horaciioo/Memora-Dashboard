import { forbidden, invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  assertDivisionAssignable,
  assertMemberAssignable,
  createMember,
  listMembers,
  memberFields,
} from '@/core/services/members/MemberService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.MemberRead,
  descriptor: { summary: 'List moderators', tags: ['members'] },
  handler: async ({ scope, access }) => {
    if (!access.isResponsable) throw forbidden()

    return listMembers(await scope(), access.isAdmin)
  },
})

export const POST = createProtectedRoute({
  permission: Permissions.MemberCreate,
  status: 201,
  descriptor: { summary: 'Add a moderator', tags: ['members'] },
  handler: async ({ raw, session, access }) => {
    if (!access.isResponsable) throw forbidden()

    const parsed = parseFormValues(await memberFields(access.isAdmin), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    await assertDivisionAssignable(parsed.values, access.isAdmin)
    await assertMemberAssignable(parsed.values, access.isAdmin)

    const member = await createMember(parsed.values)

    await recordEvent({
      eventType: 'MemberCreated',
      actorId: session.id,
      subjectId: member.id,
      targetType: 'member',
      targetId: member.id,
      summary: member.displayName,
    })

    return member
  },
})
