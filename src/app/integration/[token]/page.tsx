import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { OnboardingWizard } from '@/composites/onboarding/OnboardingWizard'
import { INTEGRATION_TICKET_COOKIE, unpackTicket } from '@/core/lib/auth/integrationTicket'
import {
  integrationFields,
  readClaim,
  resolveInvite,
} from '@/core/services/onboarding/IntegrationService'
import { ONBOARDING_COPY } from '@/declarations/onboarding/copy'
import {
  INTEGRATION_ERROR_PARAM,
  INTEGRATION_ERRORS,
  type IntegrationErrorName,
} from '@/declarations/onboarding/failures'
import { ONBOARDING_STYLES } from '@/declarations/ui/variants'
import { OnboardingShell } from '@/layouts/OnboardingShell'

export const metadata: Metadata = { title: ONBOARDING_COPY.title }

/**
 * Keep a refusal reason only when it names a declared one
 * @param {string | string[] | undefined} raw - Query value
 * @return {IntegrationErrorName | null} - Refusal reason
 */

const readFailure = (raw: string | string[] | undefined): IntegrationErrorName | null => {
  const value = Array.isArray(raw) ? raw[0] : raw
  const declared = Object.values(INTEGRATION_ERRORS) as string[]

  return value && declared.includes(value) ? (value as IntegrationErrorName) : null
}

/**
 * Public integration form, reachable without a session
 * @param {Object} context - Route context
 * @param {Promise<{ token: string }>} context.params - Dynamic segments
 * @param {Promise<Record<string, string | string[] | undefined>>} context.searchParams - Query
 * @return {Promise<JSX.Element>} - Integration page
 */

export default async function IntegrationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ token }, query] = await Promise.all([params, searchParams])
  const invite = await resolveInvite(token).catch(() => null)

  if (!invite) {
    return (
      <OnboardingShell title={ONBOARDING_COPY.invalidTitle} creator={null}>
        <p className={ONBOARDING_STYLES.lead}>{ONBOARDING_COPY.invalidDescription}</p>
      </OnboardingShell>
    )
  }

  // The identity is read from the ticket the server itself wrote, never from the URL
  const cookieStore = await cookies()
  const ticket = unpackTicket(cookieStore.get(INTEGRATION_TICKET_COOKIE)?.value)

  const [fields, claim] = await Promise.all([
    integrationFields(invite),
    ticket?.token === token ? readClaim(invite.id, ticket.claimId) : Promise.resolve(null),
  ])

  return (
    <OnboardingShell
      title={ONBOARDING_COPY.title}
      subtitle={ONBOARDING_COPY.subtitle}
      creator={invite.youtuber}
    >
      <OnboardingWizard
        token={token}
        fields={fields}
        claim={claim}
        failure={readFailure(query[INTEGRATION_ERROR_PARAM])}
      />
    </OnboardingShell>
  )
}
