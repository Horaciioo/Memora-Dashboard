'use client'

import { Button } from '@/components/elements/actions/Button'
import { Section } from '@/components/structures/page/Section'
import { useInstallState } from '@/core/hooks/pwa'
import { INSTALL_COPY, INSTALL_ROUTE_COPY } from '@/declarations/pwa/copy'
import { ICONS } from '@/declarations/ui/icons'
import { GUIDES_CARD } from '@/declarations/ui/variants'

/**
 * Install Memora on this device, or how to
 * @return {JSX.Element | null}
 */

export const InstallSection = () => {
  const { route, install } = useInstallState()
  const InstallIcon = ICONS.install

  // Unknown until the browser answers
  if (!route) return null

  return (
    <Section title={INSTALL_COPY.title} padded>
      <div className={GUIDES_CARD.card}>
        <InstallIcon className={GUIDES_CARD.glyph} aria-hidden="true" />
        <div className={GUIDES_CARD.body}>
          <p className={GUIDES_CARD.title}>{INSTALL_COPY.action}</p>
          <p className={GUIDES_CARD.lead}>{INSTALL_ROUTE_COPY[route]}</p>
        </div>
        {route === 'prompt' && (
          <Button variant="primary" icon="install" onClick={() => void install()}>
            {INSTALL_COPY.action}
          </Button>
        )}
      </div>
    </Section>
  )
}
