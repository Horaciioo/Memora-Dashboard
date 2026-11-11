import { createProtectedRoute } from '@/core/lib/http/route'
import { NEXUS_VARIABLE_VALUES } from '@/core/lib/nexus/context'
import { NEXUS_REGISTRY } from '@/core/services/nexus/NexusEngine'
import { requireNexus } from '@/core/wrappers/requireNexus'

export const GET = createProtectedRoute({
  rateLimit: 'nexus',
  handler: async (context) => {
    await requireNexus(context)

    return { commands: NEXUS_REGISTRY.project(), values: NEXUS_VARIABLE_VALUES }
  },
})
