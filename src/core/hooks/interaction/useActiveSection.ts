'use client'

import { useEffect, useState } from 'react'

import { GESTURE_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Follows the section being read: the last heading that crossed the reading line
 * @param {string[]} ids - Element ids of the headings, in reading order
 * @return {string | null} - Id of the current heading, the first one before any scroll
 */

export const useActiveSection = (ids: string[]): string | null => {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)
  const signature = ids.join('|')

  useEffect(() => {
    const nodes = signature
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null)

    if (nodes.length === 0) return

    const pick = () => {
      const line = window.innerHeight * GESTURE_SETTINGS.readingLineRatio
      const passed = nodes.filter((node) => node.getBoundingClientRect().top <= line)

      const current = passed[passed.length - 1] ?? nodes[0]

      if (current) setActiveId(current.id)
    }

    window.addEventListener('scroll', pick, { passive: true })

    return () => window.removeEventListener('scroll', pick)
  }, [signature])

  return activeId
}
