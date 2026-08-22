import type { ReactNode } from 'react'
import { AppShell } from '@/layouts/AppShell'
import { requireUser } from '@/core/wrappers/requireUser'

/**
 * Dashboard shell shared by every route in this group
 * @param {Object} props - Layout props
 * @param {ReactNode} props.children - Routed page content
 * @return {Promise<JSX.Element>} - App shell
 */

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser()

  return <AppShell>{children}</AppShell>
}
