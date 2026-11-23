import { createProtectedRoute } from '@/core/lib/http/route'
import { declaredPresences, myLiveAsks } from '@/core/services/lives/LiveAskService'
import type { LiveAsksPayload } from '@/types/liveAsks'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Lives that ask me, and news for those who run them', tags: ['lives'] },
  handler: async ({ session, access }): Promise<LiveAsksPayload> => ({
    asks: await myLiveAsks(session.id),
    declared: access.can(Permissions.CalendarManage) ? await declaredPresences(session.id) : [],
  }),
})
