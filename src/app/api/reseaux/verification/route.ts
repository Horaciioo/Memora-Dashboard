import { invalidInput } from '@/core/lib/errors'
import { createPublicRoute } from '@/core/lib/http/route'
import { lookupHandle } from '@/core/services/members/SocialLookupService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { HandleVerdict } from '@/types/social'

export const GET = createPublicRoute({
  rateLimit: 'lookup',
  descriptor: { summary: 'Check an account exists on a network', tags: ['members'] },
  handler: async ({ query }): Promise<{ verdict: HandleVerdict }> => {
    const network = query.get('reseau')
    const handle = query.get('compte')?.trim() ?? ''

    if (!network) throw invalidInput([{ field: 'reseau', message: FORM_COPY.required }])

    return { verdict: await lookupHandle(network, handle) }
  },
})
