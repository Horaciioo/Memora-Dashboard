import { cookies } from 'next/headers'

import { IDENTITY_CHECK_COOKIE } from '@/core/lib/auth/identityTicket'
import { notFound } from '@/core/lib/errors'
import { createPublicRoute } from '@/core/lib/http/route'
import { submitPseudo } from '@/core/services/identity'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { WELCOME_COPY } from '@/declarations/onboarding/welcome'
import type { FieldDefinition } from '@/types/forms'

// The one answer of this route
const PSEUDO_FIELDS: FieldDefinition[] = [
  {
    name: 'name',
    kind: 'text',
    label: WELCOME_COPY.pseudoPlaceholder,
    required: true,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
]

export const POST = createPublicRoute({
  rateLimit: 'signIn',
  fields: PSEUDO_FIELDS,
  descriptor: {
    summary: 'Give the pseudonym of a candidate whose account is not theirs',
    tags: ['welcome'],
  },
  handler: async ({ body }) => {
    const cookieStore = await cookies()
    const checkId = cookieStore.get(IDENTITY_CHECK_COOKIE)?.value
    if (!checkId) throw notFound()

    const outcome = await submitPseudo(checkId, String(body.name ?? ''))

    return { outcome }
  },
})
