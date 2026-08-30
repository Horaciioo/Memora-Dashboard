import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/composites/auth/LoginForm'
import { DiscordSignInButton } from '@/composites/auth/DiscordSignInButton'
import { AuthShell } from '@/layouts/AuthShell'
import { isDiscordConfigured } from '@/declarations/access/discord'
import {
  SIGN_IN_ERROR_PARAM,
  isIdentifierSignInAllowed,
  readSignInError,
} from '@/declarations/access/signIn'
import { ROUTES } from '@/declarations/navigation'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { SIGN_IN_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: AUTH_COPY.title }

/**
 * Sign-in screen, Discord first and the identifier form only as a development fallback
 * @param {Object} props - Route props
 * @param {Promise<Record<string, string | string[] | undefined>>} props.searchParams - URL query
 * @return {Promise<JSX.Element>} - Auth shell
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
    <AuthShell title={AUTH_COPY.title} subtitle={AUTH_COPY.subtitle}>
      <div className={SIGN_IN_STYLES.stack}>
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
        <p className={SIGN_IN_STYLES.footer}>
          <Link href={ROUTES.privacy} className={SIGN_IN_STYLES.link}>
            {AUTH_COPY.privacyLink}
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
