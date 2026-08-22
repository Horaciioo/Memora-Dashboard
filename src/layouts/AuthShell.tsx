import type { ReactNode } from 'react'

export interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

/**
 * Auth layout
 * @param {string} title - Title
 * @param {string} [subtitle] - Subtitle
 * @param {ReactNode} children - Content
 * @return {JSX.Element}
 */

export const AuthShell = ({ title, subtitle, children }: AuthShellProps) => (
  <main className="flex min-h-screen items-center justify-center px-6">
    <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-8 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold">{title}</h1>
      {subtitle && <p className="mb-6 text-sm text-[var(--color-ink-subtle)]">{subtitle}</p>}
      {children}
    </div>
  </main>
)
