import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  addToWhitelist,
  readWhitelist,
  removeFromWhitelist,
} from '@/core/services/intelligence/WhitelistService'
import { WHITELIST_COPY } from '@/declarations/intelligence/whitelist'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.ReferenceRead,
  descriptor: { summary: 'Read the Memora Intelligence whitelist', tags: ['reference'] },
  handler: () => readWhitelist(),
})

export const POST = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Admit a member to Memora Intelligence', tags: ['reference'] },
  handler: async ({ raw, access }) => {
    // Responsables read the list, only an admin edits it
    if (!access.isAdmin) throw forbidden()

    const accountId = typeof raw.accountId === 'string' ? raw.accountId : ''
    if (!accountId) throw invalidInput([{ field: 'accountId', message: WHITELIST_COPY.unknown }])

    return addToWhitelist(accountId)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Remove a member from Memora Intelligence', tags: ['reference'] },
  handler: async ({ raw, access }) => {
    if (!access.isAdmin) throw forbidden()

    const accountId = typeof raw.accountId === 'string' ? raw.accountId : ''
    if (!accountId) throw invalidInput([{ field: 'accountId', message: WHITELIST_COPY.unknown }])

    return removeFromWhitelist(accountId)
  },
})
