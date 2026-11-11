import type { Metadata } from 'next'
import { LoginForm } from '@/composites/auth/LoginForm'
import { DiscordSignInButton } from '@/composites/auth/DiscordSignInButton'
import { OfflineWipe } from '@/composites/pages/offline/OfflineWipe'
import { LoginShell } from '@/layouts/LoginShell'
import { isDiscordConfigured } from '@/declarations/access/discord'
import {
  SIGN_IN_ERROR_PARAM,
  isIdentifierSignInAllowed,
  readSignInError,
} from '@/declarations/access/signIn'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { SIGN_IN_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: AUTH_COPY.title }

/**
 * Sign-in screen
 * @param {Object} props - Route props
 * @param {Promise<Record<string, string | string[] | undefined>>} props.searchParams - URL query
 * @return {Promise<JSX.Element>} - Showcase shell
 */

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = (await searchParams)[SIGN_IN_ERROR_PARAM]
  const failure = readSignInError(typeof raw === 'string' ? raw : undefined)

  const withDiscord = isDiscordConfigured()
  const withFallback = isIdentifierSignInAllowed()

  return (
    <LoginShell>
      <div className={SIGN_IN_STYLES.stack}>
        <OfflineWipe />
        {failure && (
          <p className={SIGN_IN_STYLES.alert} role="alert">
            {failure}
          </p>
        )}
        {withDiscord && <DiscordSignInButton />}
        {withFallback && (
          <>
            {withDiscord && (
              <p className={SIGN_IN_STYLES.divider}>
                <span className={SIGN_IN_STYLES.rule} aria-hidden="true" />
              </p>
            )}
            <p className={SIGN_IN_STYLES.notice}>{AUTH_COPY.fallbackNotice}</p>
            <LoginForm />
          </>
        )}
      </div>
    </LoginShell>
  )
}
