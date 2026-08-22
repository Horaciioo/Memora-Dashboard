import { createProtectedRoute } from '@/core/lib/http/route'
import { pinNote, removeNote } from '@/core/services/members/MemberFileService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.MemberNoteWrite,
  descriptor: { summary: 'Pin or unpin a note', tags: ['members'] },
  handler: ({ params, raw }) => pinNote(params.id, raw.pinned === true),
})

export const DELETE = createProtectedRoute({
  permission: Permissions.MemberNoteWrite,
  descriptor: { summary: 'Drop a private note', tags: ['members'] },
  handler: async ({ params }) => {
    await removeNote(params.id)

    return { id: params.id }
  },
})
