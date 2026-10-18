import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { toggleFavoritePage } from '@/core/services/preferences/FavoriteService'
import { FAVORITE_COPY, FAVORITE_LABEL_MAX, FAVORITE_PATH } from '@/declarations/ui/favorites'
import { FORM_COPY } from '@/declarations/ui/copy/forms'

export const POST = createProtectedRoute({
  descriptor: { summary: 'Star or unstar a page', tags: ['preferences'] },
  handler: async ({ raw, session }) => {
    const path = typeof raw.path === 'string' ? raw.path : ''
    const label = typeof raw.label === 'string' ? raw.label.trim().slice(0, FAVORITE_LABEL_MAX) : ''
    if (!FAVORITE_PATH.test(path) || !label) {
      throw invalidInput([{ field: 'path', message: FORM_COPY.notAnOption }])
    }

    const favorites = await toggleFavoritePage(session.id, { path, label })
    if (!favorites) throw invalidInput([{ field: 'path', message: FAVORITE_COPY.full }])

    return { favorites }
  },
})
