import type { Metadata } from 'next'

import { WelcomeLinkStart } from '@/composites/welcome/WelcomeLinkStart'
import type { WelcomeLinkState } from '@/composites/welcome/WelcomeLinkStart'
import { readWelcomeLinkCreator } from '@/core/services/identity'
import {
  WELCOME_COPY,
  WELCOME_ERROR_PARAM,
  WELCOME_REFUSED,
} from '@/declarations/onboarding/welcome'

export const metadata: Metadata = { title: WELCOME_COPY.title }

/**
 * Page of the single link a Responsable generated
 * @param {Object} context - Route context
 * @param {Promise<{ token: string }>} context.params - Dynamic segments
 * @param {Promise<Record<string, string | string[] | undefined>>} context.searchParams - Query
 * @return {Promise<JSX.Element>} - Welcome page
 */

export default async function WelcomeLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ token }, query] = await Promise.all([params, searchParams])
  const link = await readWelcomeLinkCreator(token)

  const state: WelcomeLinkState = !link
    ? 'dead'
    : query[WELCOME_ERROR_PARAM] === WELCOME_REFUSED
      ? 'refused'
      : 'ready'

  return <WelcomeLinkStart token={token} state={state} creator={link?.creator ?? null} />
}
