import { createProtectedRoute } from '@/core/lib/http/route'
import { HURDLE_FIELDS, shareHurdle } from '@/core/services/tour/HurdleService'

export const POST = createProtectedRoute({
  fields: HURDLE_FIELDS,
  status: 201,
  descriptor: {
    summary: 'Tell the responsables what could slow moderation',
    tags: ['preferences'],
  },
  handler: async ({ body, session }) => {
    await shareHurdle(session, body)

    return { saved: true }
  },
})
