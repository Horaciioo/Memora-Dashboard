'use client'

import { useEffect, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { PlayGameChatBar } from '@/composites/play/mobile/PlayGameChatBar'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/useBreakpoint'
import { cn } from '@/utils/classnames'
import { PlayChat } from '@/composites/play/session/PlayChat'

import { PLAY_CHAT_BUBBLE, PLAY_GAME_BAR } from '@/declarations/ui/variants'
import { BAC_SESSION_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'

/**
 * Chat stuck to the right edge, a bubble that opens and closes, as tall as the box in the middle
 * @param {Object} props - Bubble
 * @param {Object} props.chat - Chat props, fold gesture added here
 * @param {ReactNode} props.above - Link centred right above the chat box
 * @return {JSX.Element}
 */

export const PlayChatBubble = ({
  chat,
  above,
}: {
  chat: Omit<ComponentProps<typeof PlayChat>, 'isSide' | 'onFold'>
  above?: ReactNode
}) => {
  const [isOpen, setOpen] = useState(true)
  const [isFolding, setFolding] = useState(false)
  const [height, setHeight] = useState<number | null>(null)
  const ChatIcon = ICONS.playChat
  const isMobile = useIsMobileShell()

  // Follow the height of the centred box
  useEffect(() => {
    const box = document.querySelector('[data-play-box]')
    if (!box) return
    const observer = new ResizeObserver(() => setHeight(box.getBoundingClientRect().height))
    observer.observe(box)

    return () => observer.disconnect()
  }, [])

  // Phone: bar glued to the bottom
  if (isMobile) {
    return (
      <>
        <div className={PLAY_GAME_BAR.spacer} aria-hidden="true" />
        <PlayGameChatBar chat={chat} />
      </>
    )
  }

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
      {above && <div className={PLAY_CHAT_BUBBLE.above}>{above}</div>}
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
