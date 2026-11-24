import 'server-only'

import { fill, speak } from '@/core/services/assistant/reply'
import type { Resolver } from '@/core/services/assistant/reply'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { changelogFor } from '@/declarations/changelog/helpers'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ROUTES } from '@/declarations/navigation'

/**
 * Tell the last release note, only the lines the member may read
 * @type {Resolver}
 */

export const resolveWhatsNew: Resolver = async ({ access, parsed }) => {
  const release = changelogFor(access)[0]
  if (!release) {
    return speak({ intent: parsed.intent, lines: [{ text: ASSISTANT_COPY.newsNone }] })
  }

  return speak({
    intent: parsed.intent,
    lines: [
      { text: fill(ASSISTANT_COPY.newsHead, { version: release.version, title: release.title }) },
      { text: release.intro },
      ...release.items.slice(0, ASSISTANT_SETTINGS.pointLines).map((item) => ({ text: item.text })),
      {
        text: ASSISTANT_COPY.newsMore,
        link: { href: ROUTES.changelog, label: 'Nouveautés' },
      },
    ],
  })
}
