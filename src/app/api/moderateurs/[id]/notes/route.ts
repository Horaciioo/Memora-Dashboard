import { createProtectedRoute } from '@/core/lib/http/route'
import {
  NOTE_FIELDS,
  addNote,
  assertNoteSubject,
  noteWriter,
} from '@/core/services/members/MemberFileService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { EVENT_TYPES } from '@/utils/constants/events'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.MemberNoteWrite,
  status: 201,
  fields: NOTE_FIELDS,
  descriptor: { summary: 'Add a private note', tags: ['members'] },
  handler: async ({ params, body, session, access, scope }) => {
    await assertNoteSubject(params.id, noteWriter(session, access, await scope()))
    const note = await addNote(params.id, session.id, body)

    // Body stays out of the journal
    await recordEvent({
      eventType: 'NoteAdded',
      actorId: session.id,
      subjectId: params.id,
      targetType: 'member',
      targetId: params.id,
      summary: EVENT_TYPES.byName('NoteAdded').label,
    })

    return note
  },
})
