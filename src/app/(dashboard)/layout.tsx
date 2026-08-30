import type { ReactNode } from 'react'
import { AppShell } from '@/layouts/AppShell'
import { AuthShell } from '@/layouts/AuthShell'
import { HistoryConsentGate } from '@/composites/consent/HistoryConsentGate'
import { countUnread } from '@/core/services/system/NotificationService'
import { needsHistoryConsent } from '@/core/services/preferences/ConsentService'
import { requireUser } from '@/core/wrappers/requireUser'
import { CONSENT_COPY } from '@/declarations/ui/copy/privacy'

/**
 * Dashboard shell shared by every route in this group
 * @param {Object} props - Layout props
 * @param {ReactNode} props.children - Routed page content
 * @return {Promise<JSX.Element>} - App shell
 */

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { session } = await requireUser()

  // Nothing of the dashboard opens before the agreement is on record
  if (needsHistoryConsent(session)) {
    return (
      <AuthShell title={CONSENT_COPY.title} subtitle={CONSENT_COPY.lead}>
        <HistoryConsentGate />
      </AuthShell>
    )
  }

  return <AppShell unreadCount={await countUnread(session.id)}>{children}</AppShell>
}
