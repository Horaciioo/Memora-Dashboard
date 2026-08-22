import Image from 'next/image'
import type { ReactNode } from 'react'
import { APP_ASSETS, APP_COMPANY, APP_NAME } from '@/declarations/app'

export interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

/**
 * Centred card shared by every screen reachable without a session
 * @param {string} title - Card title
 * @param {string} [subtitle] - Supporting line under the title
 * @param {ReactNode} children - Card content
 * @return {JSX.Element}
 */

export const AuthShell = ({ title, subtitle, children }: AuthShellProps) => (
  <main className="flex min-h-screen items-center justify-center px-6 py-12">
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex items-center gap-3">
        <Image
          src={APP_ASSETS.mark}
          alt={APP_NAME}
          width={44}
          height={44}
          className="rounded-[var(--radius-lg)]"
          priority
        />
        <div className="flex flex-col">
          <span className="text-lg leading-none font-extrabold tracking-tight">{APP_NAME}</span>
          <span className="text-[11px] tracking-wide text-[var(--color-ink-subtle)] uppercase">
            {APP_COMPANY}
          </span>
        </div>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-md)] sm:p-8">
        <h1 className="mb-1 text-xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mb-6 text-sm text-[var(--color-ink-subtle)]">{subtitle}</p>}
        {children}
      </div>
    </div>
  </main>
)
