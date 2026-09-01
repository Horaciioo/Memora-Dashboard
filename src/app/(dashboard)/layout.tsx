import type { ReactNode } from 'react'
import { AppShell } from '@/layouts/AppShell'
import { AuthShell } from '@/layouts/AuthShell'
import { HistoryConsentGate } from '@/composites/consent/HistoryConsentGate'
import { countUnread } from '@/core/services/system/NotificationService'
import { readSealState } from '@/core/services/auth/SealService'
import { readTwoFactorState } from '@/core/services/auth/TwoFactorService'
import { readViewContext } from '@/core/services/auth/ViewService'
import { needsHistoryConsent } from '@/core/services/preferences/ConsentService'
import { requireUser } from '@/core/wrappers/requireUser'
import { LogoutButton } from '@/composites/auth/LogoutButton'
import { PENDING_ACCOUNT_COPY } from '@/declarations/onboarding/copy'
import { CONSENT_COPY } from '@/declarations/ui/copy/privacy'
import { MemberStatuses } from '@/utils/constants/hierarchy'

/**
 * Dashboard shell shared by every route in this group
 * @param {Object} props - Layout props
 * @param {ReactNode} props.children - Routed page content
 * @return {Promise<JSX.Element>} - App shell
 */

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { session, access } = await requireUser()

  // Nothing of the dashboard opens before the agreement is on record
  if (needsHistoryConsent(session)) {
    return (
      <AuthShell title={CONSENT_COPY.title} subtitle={CONSENT_COPY.lead}>
        <HistoryConsentGate />
      </AuthShell>
    )
  }

  // An account opened by a link waits for a responsable before the shell opens
  if (session.status === MemberStatuses.Pending) {
    return (
      <AuthShell title={PENDING_ACCOUNT_COPY.title} subtitle={PENDING_ACCOUNT_COPY.lead}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-ink-subtle)]">{PENDING_ACCOUNT_COPY.body}</p>
          <LogoutButton />
        </div>
      </AuthShell>
    )
  }

  const [unreadCount, viewContext, twoFactor, seal] = await Promise.all([
    countUnread(session.id),
    readViewContext(session, access),
    readTwoFactorState(session.id),
    readSealState(),
  ])

  return (
    <AppShell unreadCount={unreadCount} viewContext={viewContext} twoFactor={twoFactor} seal={seal}>
      {children}
    </AppShell>
  )
}
