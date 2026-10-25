'use client'

import { useEffect, useState } from 'react'
import type { ComponentProps } from 'react'

import { cn } from '@/utils/classnames'
import { PlayChat } from '@/composites/play/session/PlayChat'

import { PLAY_CHAT_BUBBLE } from '@/declarations/ui/variants'
import { BAC_SESSION_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'

/**
 * Chat stuck to the right edge, a bubble that opens and closes, as tall as the box in the middle
 * @param {Object} props - Bubble
 * @param {Object} props.chat - Chat props, fold gesture added here
 * @return {JSX.Element}
 */

export const PlayChatBubble = ({ chat }: { chat: Omit<ComponentProps<typeof PlayChat>, 'isSide' | 'onFold'> }) => {
  const [isOpen, setOpen] = useState(true)
  const [isFolding, setFolding] = useState(false)
  const [height, setHeight] = useState<number | null>(null)
  const ChatIcon = ICONS.playChat

  // Follow the height of the centred box
  useEffect(() => {
    const box = document.querySelector('[data-play-box]')
    if (!box) return
    const observer = new ResizeObserver(() => setHeight(box.getBoundingClientRect().height))
    observer.observe(box)

    return () => observer.disconnect()
  }, [])

  return isOpen ? (
    <aside
      className={cn(PLAY_CHAT_BUBBLE.open, isFolding && PLAY_CHAT_BUBBLE.folding)}
      style={height ? { height } : undefined}
      onAnimationEnd={(event) => {
        if (!isFolding || event.target !== event.currentTarget) return
        setOpen(false)
        setFolding(false)
      }}
    >
      <PlayChat {...chat} isSide onFold={() => setFolding(true)} />
    </aside>
  ) : (
    <button
      type="button"
      className={PLAY_CHAT_BUBBLE.closed}
      aria-label={BAC_SESSION_COPY.unfoldSide}
      onClick={() => setOpen(true)}
    >
      <ChatIcon className={PLAY_CHAT_BUBBLE.icon} aria-hidden="true" />
    </button>
  )
}
