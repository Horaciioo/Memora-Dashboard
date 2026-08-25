import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createMember, listMembers, memberFields } from '@/core/services/members/MemberService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.MemberRead,
  descriptor: { summary: 'List moderators', tags: ['members'] },
  handler: async ({ scope }) => listMembers(await scope()),
})

export const POST = createProtectedRoute({
  permission: Permissions.MemberCreate,
  status: 201,
  descriptor: { summary: 'Add a moderator', tags: ['members'] },
  handler: async ({ raw, session }) => {
    const parsed = parseFormValues(await memberFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

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
