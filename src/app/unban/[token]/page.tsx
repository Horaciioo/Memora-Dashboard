import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { UnbanFollowUp } from '@/composites/unban/public/UnbanFollowUp'
import { UnbanGate } from '@/composites/unban/public/UnbanGate'
import { UnbanIntake } from '@/composites/unban/public/UnbanIntake'
import { UnbanNotice } from '@/composites/unban/public/UnbanNotice'
import { UNBAN_TICKET_COOKIE } from '@/core/lib/auth/unbanTicket'
import { hashToken } from '@/core/lib/unban/token'
import { unpackUnbanTicket } from '@/core/lib/unban/ticket'
import { loadUnbanScreen } from '@/core/services/unban/requests/screen'
import type { UnbanScreen } from '@/core/services/unban/requests/screen'
import { UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import { UNBAN_FAILURE_PARAM, UNBAN_FAILURES } from '@/declarations/unban/failures'
import type { UnbanFailureName } from '@/declarations/unban/failures'
import { toFieldDefinitions, TYPED_IDENTITY_FIELDS } from '@/declarations/unban/form'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { OnboardingShell } from '@/layouts/OnboardingShell'

export const metadata: Metadata = {
  title: UNBAN_PUBLIC_COPY.title,
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

// Characters of the link fingerprint that name the draft
const DRAFT_KEY_LENGTH = 16

/**
 * Keep a refusal reason only when it names a declared one
 * @param {string | string[] | undefined} raw - Query value
 * @return {UnbanFailureName | null} - Refusal reason
 */

const readFailure = (raw: string | string[] | undefined): UnbanFailureName | null => {
  const value = Array.isArray(raw) ? raw[0] : raw

  return (Object.values(UNBAN_FAILURES) as string[]).includes(value ?? '')
    ? (value as UnbanFailureName)
    : null
}

/**
 * Plain screens, a link that opens nothing
 * @param {UnbanScreen} screen - Screen to show
 * @return {JSX.Element | null} - Notice, null for the other screens
 */

const renderNotice = (screen: UnbanScreen) => {
  switch (screen.kind) {
    case 'closed':
      return (
        <UnbanNotice
          title={UNBAN_PUBLIC_COPY.closedTitle}
          text={screen.note ?? UNBAN_PUBLIC_COPY.closed}
          creator={null}
        />
      )
    case 'unknown':
      return (
        <UnbanNotice
          title={UNBAN_PUBLIC_COPY.unknownTitle}
          text={UNBAN_PUBLIC_COPY.linkUnknown}
          creator={null}
        />
      )
    case 'expired':
      return (
        <UnbanNotice
          title={UNBAN_PUBLIC_COPY.expiredTitle}
          text={UNBAN_PUBLIC_COPY.linkExpired}
          creator={screen.creator}
        />
      )
    case 'revoked':
      return (
        <UnbanNotice
          title={UNBAN_PUBLIC_COPY.revokedTitle}
          text={UNBAN_PUBLIC_COPY.linkRevoked}
          creator={screen.creator}
        />
      )
    default:
      return null
  }
}

/**
 * Public page of a Deban. link, filing then follow-up
 * @param {Object} context - Route context
 * @param {Promise<{ token: string }>} context.params - Dynamic segments
 * @param {Promise<Record<string, string | string[] | undefined>>} context.searchParams - Query
 * @return {Promise<JSX.Element>} - Page
 */

export default async function UnbanPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ token }, query] = await Promise.all([params, searchParams])
  const cookieStore = await cookies()
  const ticket = unpackUnbanTicket(cookieStore.get(UNBAN_TICKET_COOKIE)?.value)
  const screen = await loadUnbanScreen(token, ticket)

  const notice = renderNotice(screen)
  if (notice) return notice

  if (screen.kind === 'gate') {
    return (
      <OnboardingShell title={UNBAN_PUBLIC_COPY.title} creator={screen.creator}>
        <UnbanGate
          token={token}
          failure={readFailure(query[UNBAN_FAILURE_PARAM])}
          isOtherAccount={screen.isOtherAccount}
        />
      </OnboardingShell>
    )
  }

  if (screen.kind === 'followUp') {
    return (
      <OnboardingShell title={UNBAN_PUBLIC_COPY.followTitle} creator={screen.creator}>
        <UnbanFollowUp token={token} initial={screen.view} />
      </OnboardingShell>
    )
  }

  if (screen.kind !== 'intake') return null

  return (
    <OnboardingShell title={UNBAN_PUBLIC_COPY.title} creator={screen.creator}>
      <UnbanIntake
        token={token}
        draftKey={`unban:${hashToken(token).slice(0, DRAFT_KEY_LENGTH)}`}
        fields={toFieldDefinitions(screen.version.snapshot)}
        typedFields={UNBAN_SETTINGS.requireDiscordIdentity ? [] : TYPED_IDENTITY_FIELDS}
        fillToken={screen.fillToken}
        intro={screen.version.snapshot.intro}
        outro={screen.version.snapshot.outro}
        identity={screen.identity}
      />
    </OnboardingShell>
  )
}
