import { createProtectedRoute } from '@/core/lib/http/route'
import { signalSession } from '@/core/lib/recruitment/signal'
import { activateAccounts } from '@/core/services/onboarding/AccountActivationService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ACCOUNT_ACTIVATION_COPY } from '@/declarations/onboarding/copy'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.IntegrationManage,
  status: 201,
  descriptor: { summary: 'Open the accounts of the accepted candidates', tags: ['integration'] },
  handler: async ({ params, session, scope }) => {
    const activation = await activateAccounts(params.id, await scope())

    await recordEvent({
      eventType: 'RecruitmentOpened',
      actorId: session.id,
      targetType: 'recruitment',
      targetId: params.id,
      summary: ACCOUNT_ACTIVATION_COPY.activated,
    })

    await signalSession(params.id)

    return activation
  },
})
