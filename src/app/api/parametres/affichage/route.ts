import { prisma } from '@/core/lib/db'
import { readText } from '@/core/lib/forms/values'
import { createProtectedRoute } from '@/core/lib/http/route'
import { DISPLAY_FIELDS, toDisplayPreferences } from '@/core/services/preferences/DisplayService'
import {
  COLOR_VISION_REGISTRY,
  FONT_SCALE_REGISTRY,
  THEME_REGISTRY,
} from '@/declarations/access/preferences'

export const PATCH = createProtectedRoute({
  fields: DISPLAY_FIELDS,
  partial: true,
  descriptor: { summary: 'Carry the display preferences to the account', tags: ['preferences'] },
  handler: async ({ body, session }) => {
    // A value outside its registry is dropped rather than stored
    const keep = (name: string, registry: { has: (key: string) => boolean }): string | null => {
      const picked = readText(body, name)

      return picked && registry.has(picked) ? picked : null
    }

    const account = await prisma.account.update({
      where: { id: session.id },
      data: {
        theme: keep('theme', THEME_REGISTRY),
        fontScale: keep('fontScale', FONT_SCALE_REGISTRY),
        colorVision: keep('colorVision', COLOR_VISION_REGISTRY),
      },
      select: { theme: true, fontScale: true, colorVision: true },
    })

    return toDisplayPreferences(account)
  },
})
