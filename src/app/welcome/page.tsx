import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { WelcomeCheck } from '@/composites/welcome/WelcomeCheck'
import { IDENTITY_CHECK_COOKIE } from '@/core/lib/auth/identityTicket'
import { readCheck } from '@/core/services/identity'
import { ROUTES } from '@/declarations/navigation'
import { WELCOME_COPY } from '@/declarations/onboarding/welcome'

export const metadata: Metadata = { title: WELCOME_COPY.title }

/**
 * Where Memora checks the Discord account of an accepted candidate
 * @return {Promise<JSX.Element>} - Welcome page
 */

export default async function WelcomePage() {
  const cookieStore = await cookies()
  const view = await readCheck(cookieStore.get(IDENTITY_CHECK_COOKIE)?.value)

  // Without a proven identity there is nothing to check
  if (!view) redirect(ROUTES.login)

  return <WelcomeCheck view={view} />
}
