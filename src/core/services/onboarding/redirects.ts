import 'server-only'

import { cookies } from 'next/headers'

import { INTEGRATION_TICKET_COOKIE, unpackTicket } from '@/core/lib/auth/integrationTicket'
import type { AppError } from '@/core/lib/errors'
import { ROUTES } from '@/declarations/navigation'
import { INTEGRATION_ERROR_PARAM, INTEGRATION_ERRORS } from '@/declarations/onboarding/failures'
import { ErrorCodes } from '@/utils/constants/errors'

/**
 * Build the destination of a refused identity check, read from the live ticket
 * @param {AppError} error - Caught failure
 * @param {Record<string, string>} params - Dynamic segments
 * @return {Promise<string>} - Integration path
 */

export const integrationFailure = async (
  error: AppError,
  params: Record<string, string>
): Promise<string> => {
  const cookieStore = await cookies()
  const ticket = unpackTicket(cookieStore.get(INTEGRATION_TICKET_COOKIE)?.value)
  const token = params.token ?? ticket?.token

  // Without a token there is no form to send anyone back to
  if (!token) return ROUTES.login

  // A known account is the one refusal worth naming, everything else reads the same
  const reason =
    error.code === ErrorCodes.ResourceConflict
      ? INTEGRATION_ERRORS.Taken
      : INTEGRATION_ERRORS.Refused

  return `${ROUTES.integration(token)}?${INTEGRATION_ERROR_PARAM}=${reason}`
}
