import type { ReactNode } from 'react'
import { AppShell } from '@/layouts/AppShell'

/**
 * Minimal dashboard shell shared by every route in this group
 * @param {{ children: ReactNode }} props - Routed page content
 * @return {JSX.Element}
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
