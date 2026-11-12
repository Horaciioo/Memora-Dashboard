'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { matchesShortcut, parseShortcut } from '@/core/lib/nexus/terminal/shortcut'
import { NEXUS_OPEN_EVENT } from '@/declarations/nexus/unlock'
import type { NexusPreset } from '@/types/nexus'
import { NEXUS_WINDOW } from '@/declarations/nexus/window'

// Not a byte of it loads before the first use
const NexusWindow = dynamic(() => import('@/composites/nexus/NexusWindow'), { ssr: false })

const SHORTCUT = parseShortcut(NEXUS_WINDOW.shortcut)

// Editors keep their keys
const isEditing = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && target.closest('.ProseMirror, [contenteditable="true"]') !== null

/**
 * Listens for the shortcut, draws nothing until used
 * @return {JSX.Element | null}
 */

export const NexusLauncher = () => {
  const [isLoaded, setLoaded] = useState(false)
  const [isOpen, setOpen] = useState(false)
  const [isFolded, setFolded] = useState(false)
  const [preset, setPreset] = useState<NexusPreset>({ text: '', id: 0 })

  useEffect(() => {
    const isMac = /mac|iphone|ipad/i.test(navigator.userAgent)

    // Capture phase, before component listeners
    const onKey = (event: KeyboardEvent) => {
      if (!SHORTCUT || isEditing(event.target) || !matchesShortcut(event, SHORTCUT, isMac)) return
      event.preventDefault()
      setLoaded(true)
      setFolded(false)
      setOpen((current) => !current)
    }

    // Command handed over by the search palette
    const onOpen = (event: Event) => {
      setPreset((current) => ({
        text: (event as CustomEvent<{ input?: string }>).detail?.input ?? '',
        id: current.id + 1,
      }))
      setLoaded(true)
      setFolded(false)
      setOpen(true)
    }

    window.addEventListener('keydown', onKey, true)
    window.addEventListener(NEXUS_OPEN_EVENT, onOpen)

    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener(NEXUS_OPEN_EVENT, onOpen)
    }
  }, [])

  if (!isLoaded) return null

  return (
    <NexusWindow
      isOpen={isOpen}
      isFolded={isFolded}
      preset={preset}
      onFold={() => setFolded((current) => !current)}
      onClose={() => setOpen(false)}
    />
  )
}
