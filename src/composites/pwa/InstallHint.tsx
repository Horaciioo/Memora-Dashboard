'use client'

import Image from 'next/image'

import { Button } from '@/components/elements/actions/Button'
import { useInstallState } from '@/core/hooks/pwa'
import { useInstallHintStore } from '@/core/store/pwa'
import { APPLICATION_SETTINGS } from '@/declarations/configurations/settings'
import { INSTALL_COPY, INSTALL_ROUTE_COPY } from '@/declarations/pwa/copy'
import { PWA_ICONS, PWA_ICON_SIZES } from '@/declarations/pwa/manifest'
import { PWA_STYLES } from '@/declarations/ui/variants'

/**
 * One-time suggestion to install Memora on a phone, after a few visits
 * @return {JSX.Element | null}
 */

export const InstallHint = () => {
  const { route, install } = useInstallState()
  const { visits, isDismissed, isSnoozed, snooze, dismiss } = useInstallHintStore()

  const isDue = visits >= APPLICATION_SETTINGS.installHintVisits && !isDismissed && !isSnoozed
  if (!isDue || !route || route === 'installed' || route === 'manual') return null

  return (
    <aside className={PWA_STYLES.hint} aria-label={INSTALL_COPY.hintTitle}>
      <div className={PWA_STYLES.hintHead}>
        <Image
          src={PWA_ICONS.small}
          alt=""
          width={PWA_ICON_SIZES.small}
          height={PWA_ICON_SIZES.small}
          className={PWA_STYLES.hintIcon}
        />
        <div className={PWA_STYLES.hintBody}>
          <p className={PWA_STYLES.hintTitle}>{INSTALL_COPY.hintTitle}</p>
          <p className={PWA_STYLES.hintLead}>
            {route === 'prompt' ? INSTALL_COPY.hintLead : INSTALL_ROUTE_COPY[route]}
          </p>
        </div>
      </div>
      <div className={PWA_STYLES.hintActions}>
        <Button variant="ghost" onClick={dismiss}>
          {INSTALL_COPY.hintNever}
        </Button>
        <Button variant={route === 'prompt' ? 'ghost' : 'secondary'} onClick={snooze}>
          {INSTALL_COPY.hintLater}
        </Button>
        {route === 'prompt' && (
          <Button variant="primary" icon="install" onClick={() => void install()}>
            {INSTALL_COPY.action}
          </Button>
        )}
      </div>
    </aside>
  )
}
