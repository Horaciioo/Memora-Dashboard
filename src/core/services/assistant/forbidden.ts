import 'server-only'

import { speak } from '@/core/services/assistant/reply'
import type { Resolver } from '@/core/services/assistant/reply'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ROUTES } from '@/declarations/navigation'

/**
 * Say what stays the member's own to do
 * @type {Resolver}
 */

export const resolveNeverDo: Resolver = async ({ parsed }) =>
  speak({
    intent: parsed.intent,
    lines: [
      { text: ASSISTANT_COPY.neverHead },
      { text: ASSISTANT_COPY.neverMore, link: { href: ROUTES.preferences, label: 'Paramètres' } },
    ],
  })
