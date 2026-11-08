import type { ReactNode } from 'react'
import DashboardLayout from '@/app/(dashboard)/layout'
import { optionalUser } from '@/core/wrappers/requireUser'

/**
 * App shell for a member, the bare page for anyone else
 * @param {Object} props - Layout props
 * @param {ReactNode} props.children - Status page
 * @return {Promise<JSX.Element>} - Shell or page
 */

export default async function StatusLayout({ children }: { children: ReactNode }) {
  const user = await optionalUser()

  return user ? <DashboardLayout>{children}</DashboardLayout> : <>{children}</>
}
