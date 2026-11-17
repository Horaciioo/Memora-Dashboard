'use client'

import { useEffect } from 'react'

import { PlayPlayerCard } from '@/composites/play/card/PlayPlayerCard'
import { usePlayCardStore } from '@/core/store/play/playCard'

// Attribute a portrait carries
const CARD_SELECTOR = '[data-play-card]'

/**
 * Opens a player card from any portrait, a click on one never reaches the row around it
 * @return {JSX.Element | null}
 */

export const PlayCardHost = () => {
  const openId = usePlayCardStore((state) => state.openId)

  // Portrait clicks, caught first
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest(CARD_SELECTOR) : null
      const accountId = target?.getAttribute('data-play-card')
      if (!accountId) return
      event.preventDefault()
      event.stopPropagation()
      usePlayCardStore.getState().open(accountId)
    }
    document.addEventListener('click', onClick, true)

    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return openId ? <PlayPlayerCard key={openId} accountId={openId} /> : null
}
