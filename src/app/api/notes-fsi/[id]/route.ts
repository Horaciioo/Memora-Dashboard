import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import {
  NOTE_FIELDS,
  removeJuniorNote,
  updateJuniorNote,
} from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyNoteWrite,
  fields: NOTE_FIELDS,
  descriptor: { summary: 'Edit a trace kept on a junior FSI', tags: ['academy'] },
  handler: ({ params, body, session, access }) =>
    updateJuniorNote(params.id, academyScope(session, access), body),
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AcademyNoteWrite,
  descriptor: { summary: 'Drop a trace kept on a junior FSI', tags: ['academy'] },
  handler: ({ params, session, access }) =>
    removeJuniorNote(params.id, academyScope(session, access)),
})
