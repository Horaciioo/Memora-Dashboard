import { createProtectedRoute } from '@/core/lib/http/route'
import { requireNexus } from '@/core/wrappers/requireNexus'
import { checkOwnerPassword } from '@/core/services/nexus/NexusAuthService'
import { markReauthenticated } from '@/core/services/nexus/NexusSessionService'

export const POST = createProtectedRoute({
  rateLimit: 'signIn',
  handler: async (context) => {
    // A moved address is exactly why the password is asked again
    const { nexus, host, caller } = await requireNexus(context, { allowMovedAddress: true })

    const rehash = await checkOwnerPassword(host.accountId, caller, context.raw.password, 'REAUTH')
    await markReauthenticated(nexus, caller)

    return { reauthenticated: true, rehash }
  },
})
