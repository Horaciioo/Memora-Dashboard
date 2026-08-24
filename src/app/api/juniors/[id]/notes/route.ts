import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import {
  NOTE_FIELDS,
  createJuniorNote,
  listJuniorNotes,
} from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AcademyNoteRead,
  descriptor: { summary: 'Read the notes kept on a junior FSI', tags: ['academy'] },
  handler: ({ params, session, access }) =>
    listJuniorNotes(params.id, academyScope(session, access)),
})

export const POST = createProtectedRoute({
  permission: Permissions.AcademyNoteWrite,
  status: 201,
  fields: NOTE_FIELDS,
  descriptor: { summary: 'Write a trace on a junior FSI', tags: ['academy'] },
  handler: ({ params, body, session, access }) =>
    createJuniorNote(params.id, academyScope(session, access), session.id, body),
})
