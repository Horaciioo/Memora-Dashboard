import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { ContextPlayer } from '@/composites/recruitment/exercise/ContextPlayer'
import { ExerciseGate } from '@/composites/recruitment/exercise/ExerciseGate'
import { EXERCISE_TICKET_COOKIE } from '@/core/lib/auth/exerciseTicket'
import { unpackTicket } from '@/core/lib/auth/integrationTicket'
import { fillTerms } from '@/core/lib/recruitment/questionnaire'
import { resolveExerciseLink } from '@/core/services/recruitment/ExerciseLinkService'
import { EXERCISE_SETTINGS } from '@/declarations/configurations/settings'
import { EXERCISE_PUBLIC_COPY } from '@/declarations/recruitment/exerciseCopy'
import { EXERCISE_ERROR_PARAM, EXERCISE_ERRORS } from '@/declarations/recruitment/exerciseFailures'
import type { ExerciseErrorName } from '@/declarations/recruitment/exerciseFailures'
import { WRITTEN_CONTEXT_BY_KEY } from '@/declarations/recruitment/questionnaire/contexts'
import { EXERCISE_PUBLIC, ONBOARDING_STYLES } from '@/declarations/ui/variants'
import { OnboardingShell } from '@/layouts/OnboardingShell'

export const metadata: Metadata = { title: EXERCISE_PUBLIC_COPY.title }

/**
 * Keep a refusal reason only when it names a declared one
 * @param {string | string[] | undefined} raw - Query value
 * @return {ExerciseErrorName | null} - Refusal reason
 */

const readFailure = (raw: string | string[] | undefined): ExerciseErrorName | null => {
  const value = Array.isArray(raw) ? raw[0] : raw

  return (Object.values(EXERCISE_ERRORS) as string[]).includes(value ?? '')
    ? (value as ExerciseErrorName)
    : null
}

// First letter up
const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Public page of a written context
 * @param {Object} context - Route context
 * @param {Promise<{ token: string }>} context.params - Dynamic segments
 * @param {Promise<Record<string, string | string[] | undefined>>} context.searchParams - Query
 * @return {Promise<JSX.Element>} - Exercise page
 */

export default async function ExercisePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ token }, query] = await Promise.all([params, searchParams])
  const link = await resolveExerciseLink(token).catch(() => null)
  const context = link ? WRITTEN_CONTEXT_BY_KEY.get(link.contextKey) : undefined

  if (!link || !context) {
    return (
      <OnboardingShell title={EXERCISE_PUBLIC_COPY.invalidTitle} creator={null}>
        <p className={ONBOARDING_STYLES.lead}>{EXERCISE_PUBLIC_COPY.invalidDescription}</p>
      </OnboardingShell>
    )
  }

  // Only the browser that proved the identity holds the secret
  const cookieStore = await cookies()
  const ticket = unpackTicket(cookieStore.get(EXERCISE_TICKET_COOKIE)?.value)
  const isVerified = Boolean(
    ticket && ticket.token === token && link.claimToken && ticket.claimId === link.claimToken
  )

  if (!isVerified) {
    return (
      <OnboardingShell title={EXERCISE_PUBLIC_COPY.verifyTitle} creator={link.creator}>
        <ExerciseGate token={token} failure={readFailure(query[EXERCISE_ERROR_PARAM])} />
      </OnboardingShell>
    )
  }

  return (
    <main className={EXERCISE_PUBLIC.root}>
      <header className={EXERCISE_PUBLIC.head}>
        <h1 className={EXERCISE_PUBLIC.title}>{context.title}</h1>
      </header>
      <ContextPlayer
        token={token}
        context={context}
        platform={link.platform}
        brief={capitalise(fillTerms(context.brief, link.platform, link.creator.name))}
        lead={fillTerms(EXERCISE_PUBLIC_COPY.yourTurnLead, link.platform, link.creator.name)}
        playsLeft={Math.max(0, EXERCISE_SETTINGS.maxPlays - link.plays)}
      />
    </main>
  )
}
