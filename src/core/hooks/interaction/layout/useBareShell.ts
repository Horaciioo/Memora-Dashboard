'use client'

import { useEffect } from 'react'

import { useRailSlot } from '@/managers/front-end/RailSlotManager'

/**
 * Take the sidebar away and go dark while a page is open
 * @param {boolean} isActive - The page wants no sidebar
 * @return {void}
 */

export const useBareShell = (isActive: boolean): void => {
  const { claimBare } = useRailSlot()

  useEffect(() => {
    if (!isActive) return

    const { style } = document.body
    // Restored, not removed: the layout set it inline and React won't set it again
    const previous = style.getPropertyValue('--shell-sidebar-w')
    style.setProperty('--shell-sidebar-w', '0px')
    const release = claimBare()

    // The page is always dark
    const { classList } = document.documentElement
    const wasDark = classList.contains('dark')
    classList.add('dark')

    return () => {
      release()
      if (!wasDark) classList.remove('dark')
      style.setProperty('--shell-sidebar-w', previous)
    }
  }, [isActive, claimBare])
}
