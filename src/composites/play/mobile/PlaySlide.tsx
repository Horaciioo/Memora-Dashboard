'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { playTabIndexOf } from '@/composites/play/mobile/tabs'
import { PLAY_TABS } from '@/declarations/ui/variants'

/**
 * Page slides in from the side of its tab
 * @param {Object} props - Page
 * @param {ReactNode} props.children - Play page
 * @return {JSX.Element}
 */

export const PlaySlide = ({ children }: { children: ReactNode }) => {
  const path = usePathname()
  const [seen, setSeen] = useState({ path, index: playTabIndexOf(path), from: '' })

  // Direction from the tab left behind
  if (seen.path !== path) {
    const index = playTabIndexOf(path)
    const from =
      index > seen.index
        ? PLAY_TABS.slideRight
        : index < seen.index
          ? PLAY_TABS.slideLeft
          : PLAY_TABS.slideUp
    setSeen({ path, index, from })
  }

  return (
    <div key={path} className={`${PLAY_TABS.slide} ${seen.from}`}>
      {children}
    </div>
  )
}
