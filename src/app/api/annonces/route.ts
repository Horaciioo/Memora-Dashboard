import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { recordEvent } from '@/core/services/system/ActivityService'
import { notifyMentions } from '@/core/services/system/NotificationService'
import { announcementFields, createAnnouncement } from '@/core/services/work/AnnouncementService'
import { projectOptions } from '@/core/services/work/shared'
import { workViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.CommunicationWrite,
  status: 201,
  descriptor: { summary: 'Write an announcement, linked to a project or not', tags: ['projects'] },
  handler: async ({ raw, session, scope, access }) => {
    const viewer = workViewer(session, access)
    const fields = await announcementFields([], await projectOptions(await scope(), viewer))

    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const card = await createAnnouncement(session.id, parsed.values, viewer)

    await recordEvent({
      eventType: 'CommunicationPublished',
      actorId: session.id,
      targetType: card.projectId ? 'project' : 'communication',
      targetId: card.projectId ?? card.id.slice(card.id.indexOf(':') + 1),
      summary: card.title,
    })

    await notifyMentions(typeof parsed.values.body === 'string' ? parsed.values.body : '', {
      actorId: session.id,
      subject: card.title,
    })

    return card
  },
})
