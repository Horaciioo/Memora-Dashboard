import { createProtectedRoute } from '@/core/lib/http/route'
import { readPreferences, writePreferences } from '@/core/services/lives/ModPreferenceService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the Mod View preferences', tags: ['lives'] },
  handler: async ({ query, session, scope }) =>
    readPreferences(session.id, query.get('live'), await scope()),
})

export const PUT = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Save the Mod View preferences', tags: ['lives'] },
  handler: async ({ query, raw, session, scope }) =>
    writePreferences(session.id, query.get('live'), await scope(), raw.values),
})
