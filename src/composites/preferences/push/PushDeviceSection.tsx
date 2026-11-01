'use client'

import { Section } from '@/components/structures/page/Section'
import { PushDeviceCard } from '@/composites/preferences/push/PushDeviceCard'
import { PUSH_COPY } from '@/declarations/pwa/copy'
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

  // Unknown until the browser answers
  if (!support) return null

  const blocked = !isConfigured
    ? PUSH_COPY.notConfigured
    : support !== 'available'
      ? BLOCKED_COPY[support]
      : null

  return (
    <Section title={PUSH_COPY.deviceTitle} padded>
      <PushDeviceCard
        isOn={isOn}
        isBusy={isBusy}
        blocked={blocked}
        onEnable={onEnable}
        onDisable={onDisable}
        onTrial={onTrial}
      />
    </Section>
  )
}
