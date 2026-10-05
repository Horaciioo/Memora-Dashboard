import Image from 'next/image'
import type { ReactNode } from 'react'
import { APP_ASSETS, APP_COMPANY, APP_NAME } from '@/declarations/app'

export interface AuthShellProps {
  title: string
  // No longer rendered
  subtitle?: string
  children: ReactNode
}

/**
 * Centred card shared by every screen reachable without a session
 * @param {string} title - Card title
 * @param {ReactNode} children - Card content
 * @return {JSX.Element}
 */

export const AuthShell = ({ title, children }: AuthShellProps) => (
  <main className="flex min-h-screen items-center justify-center px-6 py-12">
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex items-center justify-center">
        <Image
          src={APP_ASSETS.wordmark}
          alt={`${APP_COMPANY} ${APP_NAME}`}
          width={168}
          height={59}
          className="h-auto w-40"
          priority
        />
      </div>
      <div className="card-surface rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-md)] sm:p-8">
        <h1 className="mb-6 text-xl font-black tracking-tight">{title}</h1>
        {children}
      </div>
    </div>
  </main>
)
