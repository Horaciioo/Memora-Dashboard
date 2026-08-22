import Link from 'next/link'
import type { ReactNode } from 'react'
import { AppearanceToggle } from '@/components/elements/actions/AppearanceToggle'
import { ColorVisionSelect } from '@/components/elements/actions/ColorVisionSelect'
import { ThemeToggle } from '@/components/elements/actions/ThemeToggle'
import { LogoutButton } from '@/composites/auth/LogoutButton'
import { UserBadge } from '@/composites/auth/UserBadge'

export interface AppShellProps {
  children: ReactNode
}

/**
 * App layout
 * @param {ReactNode} children - Page content
 * @return {JSX.Element}
 */

export const AppShell = ({ children }: AppShellProps) => (
  <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-8">
    <nav className="flex items-center gap-6 border-b border-[var(--color-border)] pb-4">
      <span className="font-semibold">Dashboard Template</span>
      <Link href="/overview" className="text-sm hover:underline">
        Overview
      </Link>
      <Link href="/entities" className="text-sm hover:underline">
        Entities
      </Link>
      <div className="ml-auto flex items-center gap-3">
        <UserBadge />
        <ColorVisionSelect />
        <AppearanceToggle />
        <ThemeToggle />
        <LogoutButton />
      </div>
    </nav>
    {children}
  </div>
)
