import { createProtectedRoute } from '@/core/lib/http/route'
import {
  readAvailabilityChoice,
  setAvailability,
} from '@/core/services/preferences/AvailabilityService'

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Show online, offline or do not disturb', tags: ['preferences'] },
  handler: async ({ raw, session }) => ({
    availability: await setAvailability(session.id, readAvailabilityChoice(raw.availability)),
  }),
})
