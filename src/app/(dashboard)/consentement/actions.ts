'use server'

import { redirect } from 'next/navigation'

import { logout } from '@/app/connexion/actions'
import { acceptHistoryConsent } from '@/core/services/preferences/ConsentService'
import { requireUser } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { CONSENT_COPY } from '@/declarations/ui/copy/privacy'

/**
 * Result of a consent attempt
 * @typedef {Object} ConsentState
 * @property {string} [error] - Failure message
 */

export interface ConsentState {
  error?: string
}

/**
 * Record the agreement of the signed-in member
 * @param {ConsentState} _previousState - Previous form state, unused
 * @param {FormData} formData - Submitted checkbox
 * @return {Promise<ConsentState>} - Failure message or a redirect
 */

export async function acceptConsent(
  _previousState: ConsentState,
  formData: FormData
): Promise<ConsentState> {
  if (formData.get('agreed') !== 'on') return { error: CONSENT_COPY.required }

  const { session } = await requireUser()
  await acceptHistoryConsent(session.id)

  redirect(ROUTES.dashboard)
}

/**
 * Sign out rather than agree
 * @return {Promise<never>} - Redirect
 */

export async function refuseConsent(): Promise<never> {
  return logout()
}
