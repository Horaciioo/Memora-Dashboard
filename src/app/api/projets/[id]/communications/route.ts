import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { addCommunication, communicationFields } from '@/core/services/work/ProjectService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.CommunicationWrite,
  status: 201,
  descriptor: { summary: 'Write a project announcement', tags: ['projects'] },
  handler: async ({ params, raw, session }) => {
    const parsed = parseFormValues(await communicationFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const communication = await addCommunication(params.id, session.id, parsed.values)

    await recordEvent({
      eventType: 'CommunicationPublished',
      actorId: session.id,
      targetType: 'project',
      targetId: params.id,
      summary: communication.title,
    })

    return communication
  },
})
