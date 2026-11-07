import { invalidInput } from '@/core/lib/errors'
import { createPublicRoute } from '@/core/lib/http/route'
import { lookupHandle } from '@/core/services/members/SocialLookupService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { HandleLookupResult } from '@/types/social'

export const GET = createPublicRoute({
  rateLimit: 'lookup',
  descriptor: { summary: 'Check an account exists on a network', tags: ['members'] },
  handler: async ({ query }): Promise<HandleLookupResult> => {
    const network = query.get('network')
    const handle = query.get('handle')?.trim() ?? ''

    if (!network) throw invalidInput([{ field: 'network', message: FORM_COPY.required }])

    return lookupHandle(network, handle)
  },
})
