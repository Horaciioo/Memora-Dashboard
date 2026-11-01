'use client'

import { useCallback, useState } from 'react'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PushCategoryName } from '@/declarations/notifications/categories'
import { PUSH_COPY } from '@/declarations/pwa/copy'
import type { PushDeviceView, PushSettingsView } from '@/types/push'

/**
 * Push families and devices of the member
 * @typedef {Object} PushSettingsState
 * @property {PushCategoryName[]} muted - Silenced families
 * @property {PushDeviceView[]} devices - Subscribed browsers
 * @property {(category: PushCategoryName, isOn: boolean) => void} toggle - Silences or restores a family
 * @property {(device: PushDeviceView) => void} keep - Adds or refreshes a device
 * @property {(id: string) => void} forget - Removes a device
 * @property {(endpoint: string) => void} drop - Removes the device behind an address
 * @property {() => void} trial - Sends a trial push
 */

export interface PushSettingsState {
  muted: PushCategoryName[]
  devices: PushDeviceView[]
  toggle: (category: PushCategoryName, isOn: boolean) => void
  keep: (device: PushDeviceView) => void
  forget: (id: string) => void
  drop: (endpoint: string) => void
  trial: () => void
}

/**
 * Drive the push settings, each gesture settling on screen first
 * @param {PushSettingsView} initial - Settings resolved server-side
 * @return {PushSettingsState} - State and gestures
 */

export const usePushSettings = (initial: PushSettingsView): PushSettingsState => {
  const [muted, setMuted] = useState(initial.muted)
  const [devices, setDevices] = useState(initial.devices)
  const { run } = useMutation()

  const toggle = useCallback(
    (category: PushCategoryName, isOn: boolean) => {
      const next = isOn ? muted.filter((name) => name !== category) : [...muted, category]
      setMuted(next)
      void run(() => apiPatch(API_ROUTES.push, { muted: next }))
    },
    [muted, run]
  )

  const keep = useCallback((device: PushDeviceView) => {
    setDevices((current) => [device, ...current.filter((entry) => entry.id !== device.id)])
  }, [])

  const forget = useCallback(
    (id: string) => {
      setDevices((current) => current.filter((entry) => entry.id !== id))
      void run(() => apiDelete(API_ROUTES.pushDevice(id)))
    },
    [run]
  )

  const drop = useCallback((endpoint: string) => {
    setDevices((current) => current.filter((entry) => entry.endpoint !== endpoint))
  }, [])

  const trial = useCallback(() => {
    void run(() => apiPost(API_ROUTES.pushTrial, {}), PUSH_COPY.testSent)
  }, [run])

  return { muted, devices, toggle, keep, forget, drop, trial }
}
