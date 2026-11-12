import Image from 'next/image'
import type { ReactNode } from 'react'
import Link from '@/components/elements/navigation/AppLink'
import { APP_ASSETS, APP_COMPANY, APP_NAME } from '@/declarations/app'
import { ROUTES } from '@/declarations/navigation'
import { AUTH_COPY, LOGIN_SHOWCASE } from '@/declarations/ui/copy/auth'
import { LOGIN_SHELL } from '@/declarations/ui/blocks'

/**
 * Photograph page around the sign-in card
 * @param {ReactNode} children - Card content
 * @return {JSX.Element}
 */

export const LoginShell = ({ children }: { children: ReactNode }) => (
  <div className={LOGIN_SHELL.page}>
    <Image
      src={LOGIN_SHOWCASE.image}
      alt=""
      fill
      priority
      sizes="100vw"
      className={LOGIN_SHELL.photo}
    />
    <div className={LOGIN_SHELL.scrim} aria-hidden="true" />
    <header className={LOGIN_SHELL.header}>
      <Image
        src={APP_ASSETS.wordmark}
        alt={`${APP_COMPANY} ${APP_NAME}`}
        width={168}
        height={59}
        className={LOGIN_SHELL.wordmark}
        priority
      />
      <Link href={ROUTES.privacy} className={LOGIN_SHELL.link}>
        {AUTH_COPY.privacyLink}
      </Link>
    </header>
    <main className={LOGIN_SHELL.main}>
      <div className={LOGIN_SHELL.card}>
        <h1 className={LOGIN_SHELL.cardTitle}>{AUTH_COPY.title}</h1>
        {children}
      </div>
    </main>
  </div>
)
