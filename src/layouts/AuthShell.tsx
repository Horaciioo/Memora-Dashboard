import Image from 'next/image'
import type { ReactNode } from 'react'
import { MembersIllustration } from '@/components/elements/feedback/EmptyStateIllustration'
import { APP_ASSETS, APP_COMPANY, APP_NAME } from '@/declarations/app'
import { AUTH_SHELL } from '@/declarations/ui/blocks'

export interface AuthShellProps {
  title: string
  // No longer rendered
  subtitle?: string
  children: ReactNode
}

/**
 * Gradient figure and card shared by every screen reachable without a session
 * @param {string} title - Card title
 * @param {ReactNode} children - Card content
 * @return {JSX.Element}
 */

export const AuthShell = ({ title, children }: AuthShellProps) => (
  <div className={AUTH_SHELL.page}>
    <div className={AUTH_SHELL.art} aria-hidden="true">
      <MembersIllustration className={AUTH_SHELL.figure} />
    </div>
    <main className={AUTH_SHELL.main}>
      <div className={AUTH_SHELL.column}>
        <div className={AUTH_SHELL.logo}>
          <Image
            src={APP_ASSETS.wordmark}
            alt={`${APP_COMPANY} ${APP_NAME}`}
            width={168}
            height={59}
            className={AUTH_SHELL.wordmark}
            priority
          />
        </div>
        <div className={AUTH_SHELL.card}>
          <h1 className={AUTH_SHELL.title}>{title}</h1>
          {children}
        </div>
      </div>
    </main>
  </div>
)
