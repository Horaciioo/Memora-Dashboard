'use client'

import { Button } from '@/components/elements/actions/Button'
import { Section } from '@/components/structures/page/Section'
import { PUSH_COPY } from '@/declarations/pwa/copy'
import { ICONS } from '@/declarations/ui/icons'
import { GUIDES_CARD } from '@/declarations/ui/variants'
import type { PushDeviceState } from '@/core/hooks/pwa'
import type { PushSupport } from '@/types/pwa'

export interface PushDeviceSectionProps {
  device: PushDeviceState
  isConfigured: boolean
  onEnable: () => void
  onDisable: () => void
  onTrial: () => void
}

// Why the switch cannot be offered
const BLOCKED_COPY: Record<Exclude<PushSupport, 'available'>, string> = {
  unsupported: PUSH_COPY.unsupported,
  needsInstall: PUSH_COPY.iosNeedsInstall,
  denied: PUSH_COPY.denied,
}

/**
 * Pushes on this browser: state and switch
 * @param {PushDeviceState} device - This browser
 * @param {boolean} isConfigured - Server holds its keys
 * @param {() => void} onEnable - Turns pushes on
 * @param {() => void} onDisable - Turns pushes off
 * @param {() => void} onTrial - Sends a trial
 * @return {JSX.Element | null}
 */

export const PushDeviceSection = ({
  device,
  isConfigured,
  onEnable,
  onDisable,
  onTrial,
}: PushDeviceSectionProps) => {
  const { support, endpoint, isBusy } = device
  const isOn = Boolean(endpoint)
  const Glyph = isOn ? ICONS.bell : ICONS.bellOff

  // Unknown until the browser answers
  if (!support) return null

  const blocked = !isConfigured
    ? PUSH_COPY.notConfigured
    : support !== 'available'
      ? BLOCKED_COPY[support]
      : null

  return (
    <Section title={PUSH_COPY.deviceTitle} padded>
      <div className={GUIDES_CARD.card}>
        <Glyph className={GUIDES_CARD.glyph} aria-hidden="true" />
        <div className={GUIDES_CARD.body}>
          <p className={GUIDES_CARD.title}>{isOn ? PUSH_COPY.enabled : PUSH_COPY.deviceLead}</p>
          {blocked && <p className={GUIDES_CARD.hint}>{blocked}</p>}
        </div>
        {!blocked && isOn && (
          <>
            <Button variant="secondary" icon="bell" disabled={isBusy} onClick={onTrial}>
              {PUSH_COPY.testAction}
            </Button>
            <Button variant="ghost" icon="bellOff" disabled={isBusy} onClick={onDisable}>
              {PUSH_COPY.disable}
            </Button>
          </>
        )}
        {!blocked && !isOn && (
          <Button variant="primary" icon="bell" disabled={isBusy} onClick={onEnable}>
            {isBusy ? PUSH_COPY.pending : PUSH_COPY.enable}
          </Button>
        )}
      </div>
    </Section>
  )
}
