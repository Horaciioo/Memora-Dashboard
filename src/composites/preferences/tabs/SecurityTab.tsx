'use client'

import { SettingsGroup } from '@/composites/preferences/SettingsGroup'
import { TipList } from '@/composites/preferences/TipList'
import { ProtectionScore } from '@/composites/security/ProtectionScore'
import type { ProtectionCheck } from '@/composites/security/ProtectionScore'
import { SessionsSection } from '@/composites/security/SessionsSection'
import { useSessions } from '@/core/hooks/data/people/useSessions'
import { SECURITY_COPY } from '@/declarations/preferences/settings'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'
import type { AccountSession } from '@/types/preferences'
import type { PlatformLinkView } from '@/types/platforms'

export interface SecurityTabProps {
  sessions: AccountSession[]
  links: PlatformLinkView[]
}

/**
 * Security: protection score, connected devices, good habits
 * @param {AccountSession[]} sessions - Sessions resolved server-side
 * @param {PlatformLinkView[]} links - Linked platform accounts
 * @return {JSX.Element}
 */

export const SecurityTab = ({ sessions, links }: SecurityTabProps) => {
  const state = useSessions(sessions)
  const { factor } = useSeal()

  const hasRevoked = links.some((link) => link.revoked)
  const checks: ProtectionCheck[] = [
    { title: SECURITY_COPY.discordTitle, lead: SECURITY_COPY.discordOk, isOk: true },
    {
      title: SECURITY_COPY.sessionsTitle,
      lead: state.sessions.length <= 1 ? SECURITY_COPY.sessionsOk : SECURITY_COPY.sessionsWarn,
      isOk: state.sessions.length <= 1,
    },
    {
      title: SECURITY_COPY.accountsTitle,
      lead: hasRevoked
        ? SECURITY_COPY.accountsWarn
        : links.length > 0
          ? SECURITY_COPY.accountsOk
          : SECURITY_COPY.accountsNone,
      isOk: !hasRevoked,
    },
    {
      title: SECURITY_COPY.sealTitle,
      lead: factor.seal.isUnsealed ? SECURITY_COPY.sealWarn : SECURITY_COPY.sealOk,
      isOk: !factor.seal.isUnsealed,
    },
  ]

  return (
    <div className={PREFERENCE_STYLES.stack}>
      <ProtectionScore checks={checks} />
      <SessionsSection state={state} />
      <SettingsGroup title={SECURITY_COPY.tipsTitle}>
        <TipList items={SECURITY_COPY.tips} />
      </SettingsGroup>
    </div>
  )
}
