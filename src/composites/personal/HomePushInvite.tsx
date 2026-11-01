'use client'

import { PushDeviceCard } from '@/composites/preferences/push/PushDeviceCard'
import { usePushDevice } from '@/core/hooks/pwa'

export interface HomePushInviteProps {
  publicKey: string | null
}

/**
 * Home card asking to switch pushes on, gone once this device is subscribed
 * @param {string | null} publicKey - Server push key, null when not set up
 * @return {JSX.Element | null}
 */

export const HomePushInvite = ({ publicKey }: HomePushInviteProps) => {
  const device = usePushDevice(publicKey)

  // Only offered when one tap can finish the job
  if (!publicKey || device.support !== 'available' || device.endpoint) return null

  return (
    <PushDeviceCard
      isOn={false}
      isBusy={device.isBusy}
      blocked={null}
      onEnable={() => void device.enable()}
    />
  )
}
