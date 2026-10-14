import 'server-only'

import { cookies } from 'next/headers'

import { EXERCISE_TICKET_COOKIE } from '@/core/lib/auth/exerciseTicket'
import { unpackTicket } from '@/core/lib/auth/integrationTicket'
import type { AppError } from '@/core/lib/errors'
import { ROUTES } from '@/declarations/navigation'
import { EXERCISE_ERROR_PARAM, EXERCISE_ERRORS } from '@/declarations/recruitment/exerciseFailures'
import { ErrorCodes } from '@/utils/constants/errors'

/**
 * Build the destination of a refused identity check
 * @param {AppError} error - Caught failure
 * @param {Record<string, string>} params - Dynamic segments
 * @return {Promise<string>} - Exercise path
 */

export const exerciseFailure = async (
  error: AppError,
  params: Record<string, string>
): Promise<string> => {
  const cookieStore = await cookies()
  const ticket = unpackTicket(cookieStore.get(EXERCISE_TICKET_COOKIE)?.value)
  const token = params.token ?? ticket?.token

  // Without a token there is nowhere to go back to
  if (!token) return ROUTES.login

  const reason =
    error.code === ErrorCodes.InsufficientPermissions
      ? EXERCISE_ERRORS.WrongAccount
      : EXERCISE_ERRORS.Refused

  return `${ROUTES.exercise(token)}?${EXERCISE_ERROR_PARAM}=${reason}`
}
