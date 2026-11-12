import 'server-only'

import { notify } from '@/core/services/system/NotificationService'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { findHandlers } from './assignee'
import type { UnbanRequest } from '@prisma/client'

/**
 * Tell the members who may handle a creator's requests that a new one arrived
 * @param {Pick<UnbanRequest, 'id' | 'youtuberId' | 'discordName'>} request - Request just filed
 * @return {Promise<void>} - Raised, a failure never undoes the filing
 */

export const alertHandlers = async (
  request: Pick<UnbanRequest, 'id' | 'youtuberId' | 'discordName'>
): Promise<void> => {
  try {
    await notify({
      kind: 'UnbanSubmitted',
      recipients: await findHandlers(request.youtuberId, UNBAN_SETTINGS.notifyMax),
      target: 'unbanRequest',
      targetId: request.id,
      subject: request.discordName,
      once: true,
    })
  } catch {
    // The tasks of the home still carry the request
  }
}
