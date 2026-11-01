'use client'

import { PushCategoriesSection } from '@/composites/preferences/push/PushCategoriesSection'
import { PushDeviceSection } from '@/composites/preferences/push/PushDeviceSection'
import { PushDevicesSection } from '@/composites/preferences/push/PushDevicesSection'
import { usePushDevice, usePushSettings } from '@/core/hooks/pwa'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'
import type { PushSettingsView } from '@/types/push'

export interface PushPreferencesProps {
  publicKey: string | null
  initial: PushSettingsView
}

/**
 * Notifications tab: this device, families and subscribed browsers
 * @param {string | null} publicKey - Server push key, null when not set up
 * @param {PushSettingsView} initial - Settings resolved server-side
 * @return {JSX.Element}
 */

export const PushPreferences = ({ publicKey, initial }: PushPreferencesProps) => {
  const device = usePushDevice(publicKey)
  const settings = usePushSettings(initial)

  // Switching this browser updates its line below
  const enable = async () => {
    const added = await device.enable()
    if (added) settings.keep(added)
  }

  const disable = async () => {
    const endpoint = device.endpoint
    if ((await device.disable()) && endpoint) settings.drop(endpoint)
  }

  // This browser forgotten from the list unsubscribes too, or it would sign back in
  const forget = (id: string) => {
    const isCurrent = settings.devices.some(
      (entry) => entry.id === id && entry.endpoint === device.endpoint
    )
    if (isCurrent) return void disable()

    settings.forget(id)
  }

  return (
    <div className={PREFERENCE_STYLES.stack}>
      <PushDeviceSection
        device={device}
        isConfigured={Boolean(publicKey)}
        onEnable={() => void enable()}
        onDisable={() => void disable()}
        onTrial={settings.trial}
      />
      <PushCategoriesSection muted={settings.muted} onToggle={settings.toggle} />
      <PushDevicesSection
        devices={settings.devices}
        currentEndpoint={device.endpoint}
        onForget={forget}
      />
    </div>
  )
}
