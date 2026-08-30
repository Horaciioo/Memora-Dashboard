import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  addCommunication,
  communicationFields,
  projectTeam,
} from '@/core/services/work/ProjectService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { notify, notifyMentions } from '@/core/services/system/NotificationService'
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

    await notify({
      kind: 'CommunicationPublished',
      recipients: await projectTeam(params.id),
      actorId: session.id,
      target: 'project',
      targetId: params.id,
      subject: communication.title,
    })

    await notifyMentions(communication.body, {
      actorId: session.id,
      target: 'project',
      targetId: params.id,
      subject: communication.title,
    })

    return communication
  },
})
