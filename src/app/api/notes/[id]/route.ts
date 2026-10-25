import { createProtectedRoute } from '@/core/lib/http/route'
import { noteWriter, pinNote, removeNote } from '@/core/services/members/MemberFileService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.MemberNoteWrite,
  descriptor: { summary: 'Pin or unpin a note', tags: ['members'] },
  handler: async ({ params, raw, session, access, scope }) =>
    pinNote(params.id, raw.pinned === true, noteWriter(session, access, await scope())),
})

export const DELETE = createProtectedRoute({
  permission: Permissions.MemberNoteWrite,
  descriptor: { summary: 'Drop a private note', tags: ['members'] },
  handler: async ({ params, session, access, scope }) => {
    await removeNote(params.id, noteWriter(session, access, await scope()))

    return { id: params.id }
  },
})
