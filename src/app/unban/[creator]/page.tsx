import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { UnbanFollowUp } from '@/composites/unban/public/UnbanFollowUp'
import { UnbanGate } from '@/composites/unban/public/UnbanGate'
import { API_ROUTES } from '@/core/lib/api/routes'
import { SKIPS_DISCORD } from '@/core/services/auth/devIdentity'
import { fillCreator } from '@/core/lib/academy/creator'
import { UnbanIntake } from '@/composites/unban/public/UnbanIntake'
import { UnbanNotice } from '@/composites/unban/public/UnbanNotice'
import { UNBAN_TICKET_COOKIE } from '@/core/lib/auth/unbanTicket'
import { unpackUnbanTicket } from '@/core/lib/unban/ticket'
import { loadUnbanScreen } from '@/core/services/unban/requests/screen'
import type { UnbanScreen } from '@/core/services/unban/requests/screen'
import { UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import { UNBAN_FAILURE_PARAM, UNBAN_FAILURES } from '@/declarations/unban/failures'
import type { UnbanFailureName } from '@/declarations/unban/failures'
import { toPageGroups, TYPED_IDENTITY_FIELDS } from '@/declarations/unban/form'
import type { UnbanFormSnapshot } from '@/declarations/unban/form'
import { UNBAN_QUESTION_TYPE_REGISTRY } from '@/declarations/unban/registries'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { UnbanShell } from '@/composites/unban/public/UnbanShell'

export const metadata: Metadata = {
  title: UNBAN_PUBLIC_COPY.title,
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

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
 * Addresses single choices lead to, by option identifier
 * @param {UnbanFormSnapshot} snapshot - Form served
 * @return {Record<string, string>} - Address per option
 */

const redirectsOf = (snapshot: UnbanFormSnapshot): Record<string, string> =>
  Object.fromEntries(
    snapshot.questions
      .filter(({ type }) => UNBAN_QUESTION_TYPE_REGISTRY.get(type).fieldKind === 'select')
      .flatMap(({ options }) => options ?? [])
      .flatMap(({ id, redirectUrl }) => (redirectUrl ? [[id, redirectUrl]] : []))
  )

/**
 * Plain screens, an address that opens nothing
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
    default:
      return null
  }
}

/**
 * Public page of a creator's Deban. form, filing then follow-up
 * @param {Object} context - Route context
 * @param {Promise<{ creator: string }>} context.params - Dynamic segments
 * @param {Promise<Record<string, string | string[] | undefined>>} context.searchParams - Query
 * @return {Promise<JSX.Element>} - Page
 */

export default async function UnbanPage({
  params,
  searchParams,
}: {
  params: Promise<{ creator: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ creator: slug }, query] = await Promise.all([params, searchParams])
  const cookieStore = await cookies()
  const ticket = unpackUnbanTicket(cookieStore.get(UNBAN_TICKET_COOKIE)?.value)
  const screen = await loadUnbanScreen(slug, ticket)

  const notice = renderNotice(screen)
  if (notice) return notice

  if (screen.kind === 'gate') {
    const failure = readFailure(query[UNBAN_FAILURE_PARAM])

    // Dev signs in alone, a refusal or another account stays on the gate
    if (SKIPS_DISCORD && !failure && !screen.isOtherAccount) redirect(API_ROUTES.unbanDiscord(slug))

    return (
      <UnbanShell title={UNBAN_PUBLIC_COPY.title} creator={screen.creator}>
        <UnbanGate slug={slug} failure={failure} isOtherAccount={screen.isOtherAccount} />
      </UnbanShell>
    )
  }

  if (screen.kind === 'followUp') {
    return (
      <UnbanShell title={UNBAN_PUBLIC_COPY.followTitle} creator={screen.creator}>
        <UnbanFollowUp slug={slug} initial={screen.view} />
      </UnbanShell>
    )
  }

  if (screen.kind !== 'intake') return null

  // The creator's name takes the place of its token
  const snapshot = fillCreator(screen.version.snapshot, screen.creator.name)

  return (
    <UnbanShell title={UNBAN_PUBLIC_COPY.title} creator={screen.creator}>
      <UnbanIntake
        slug={slug}
        draftKey={`unban:${slug}`}
        pages={toPageGroups(snapshot)}
        typedFields={UNBAN_SETTINGS.requireDiscordIdentity ? [] : TYPED_IDENTITY_FIELDS}
        fillToken={screen.fillToken}
        intro={snapshot.intro}
        outro={snapshot.outro}
        identity={screen.identity}
        redirects={redirectsOf(snapshot)}
      />
    </UnbanShell>
  )
}
