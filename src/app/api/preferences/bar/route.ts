import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { isDockPath } from '@/core/lib/pwa/dock'
import { APPLICATION_SETTINGS } from '@/declarations/configurations/settings'
import { NAVIGATION } from '@/declarations/navigation'
import { FORM_COPY } from '@/declarations/ui/copy/forms'

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Pick the pages of my phone dock', tags: ['preferences'] },
  handler: async ({ raw, session }) => {
    const paths: unknown[] = Array.isArray(raw.paths) ? raw.paths : []
    // An empty slot keeps the proposed page
    const picked = paths.filter((path) => path !== '')
    const isValid =
      paths.length <= APPLICATION_SETTINGS.dockSlots &&
      paths.every((path) => typeof path === 'string') &&
      picked.every((path) => isDockPath(path as string, NAVIGATION)) &&
      new Set(picked).size === picked.length
    if (!isValid) throw invalidInput([{ field: 'paths', message: FORM_COPY.notAnOption }])

    const account = await prisma.account.update({
      where: { id: session.id },
      data: { mobileDock: paths as string[] },
      select: { mobileDock: true },
    })

    return { paths: account.mobileDock }
  },
})
