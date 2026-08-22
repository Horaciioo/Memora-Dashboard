import { createProtectedRoute } from '@/core/lib/http/route'
import { NOTE_FIELDS, addNote } from '@/core/services/members/MemberFileService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.MemberNoteWrite,
  status: 201,
  fields: NOTE_FIELDS,
  descriptor: { summary: 'Add a private note', tags: ['members'] },
  handler: async ({ params, body, session }) => {
    const note = await addNote(params.id, session.id, body)

    await recordEvent({
      eventType: 'NoteAdded',
      actorId: session.id,
      subjectId: params.id,
      targetType: 'member',
      targetId: params.id,
      summary: note.body.slice(0, 80),
    })

    return note
  },
})
