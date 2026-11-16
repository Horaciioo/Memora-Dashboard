'use client'

import { useEffect } from 'react'

import { PlayHudPanel } from '@/composites/play/hud/PlayHudPanel'
import type { PlayHudRow } from '@/composites/play/hud/PlayHudPanel'
import { usePlayScoreStore } from '@/core/store/play/playScore'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'

export interface ConcordatPanelsProps {
  rows: PlayHudRow[]
}

/**
 * Ranking, folded away until the trophy key or Tab
 * @param {ConcordatPanelsProps} props - Rows
 * @return {JSX.Element}
 */

export const ConcordatPanels = ({ rows }: ConcordatPanelsProps) => {
  const isRankOpen = usePlayScoreStore((state) => state.isOpen)
  const toggleRank = usePlayScoreStore((state) => state.toggle)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (target?.closest('input:not([type="range"]), textarea, [contenteditable="true"]')) return
      if (event.key === 'Tab') {
        event.preventDefault()
        toggleRank()
      }
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [toggleRank])

  return isRankOpen ? (
    <div className={CONCORDAT_HUD.ranking}>
      <PlayHudPanel rows={rows} />
    </div>
  ) : null
}
