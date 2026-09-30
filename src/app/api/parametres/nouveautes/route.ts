import { prisma } from '@/core/lib/db'
import { readText } from '@/core/lib/forms/values'
import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { CHANGELOG_RELEASES } from '@/declarations/changelog/releases'
import { SEEN_RELEASE_FIELDS } from '@/declarations/changelog/fields'

export const POST = createProtectedRoute({
  fields: SEEN_RELEASE_FIELDS,
  descriptor: { summary: 'Mark a release note as read', tags: ['preferences'] },
  handler: async ({ body, session }) => {
    const version = readText(body, 'version')

    // Only published notes
    if (!CHANGELOG_RELEASES.some((release) => release.version === version)) {
      throw invalidInput([{ field: 'version', message: CHANGELOG_COPY.unknownVersion }])
    }

    await prisma.account.update({
      where: { id: session.id },
      data: { seenReleaseVersion: version },
    })

    return { seenReleaseVersion: version }
  },
})
