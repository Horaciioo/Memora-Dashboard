import 'server-only'

import { findPage } from '@/core/lib/assistant/intents'
import { tokenize } from '@/core/lib/assistant/normalize'
import { gateOf } from '@/core/services/assistant/navigation'
import { fill, speak } from '@/core/services/assistant/reply'
import type { Resolver } from '@/core/services/assistant/reply'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { permissionMeta } from '@/utils/constants/permissions'

/**
 * Say why a page is shut, in the words of the right it asks
 * @type {Resolver}
 */

export const resolveWhy: Resolver = async ({ session, access, request, parsed }) => {
  const page = findPage(tokenize(request.text))?.page
  if (!page) return speak({ intent: parsed.intent, lines: [{ text: ASSISTANT_COPY.whyWhich }] })

  const gate = gateOf(page, session, access)
  if (gate.isOpen) {
    return speak({
      intent: parsed.intent,
      lines: [
        {
          text: fill(ASSISTANT_COPY.whyOpen, { page: page.label }),
          link: { href: page.href, label: page.label },
        },
      ],
    })
  }

  const right = gate.missing ? permissionMeta(gate.missing)?.displayName : null

  return speak({
    intent: parsed.intent,
    lines: [
      {
        text: right
          ? fill(ASSISTANT_COPY.whyRight, { page: page.label, right })
          : fill(ASSISTANT_COPY.whyRole, { page: page.label }),
      },
      { text: ASSISTANT_COPY.whyAdmin },
    ],
  })
}
