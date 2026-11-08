'use client'

import { useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { PlayChat } from '@/composites/play/session/PlayChat'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { usePlayBubbles } from '@/core/hooks/data/play/usePlayBubbles'
import { usePlayChatDraft } from '@/core/hooks/data/play/usePlayChatDraft'
import { usePlayChatLines } from '@/core/hooks/data/play/usePlayChatLines'
import { PLAY_HUB_COPY, PLAY_MOBILE_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_GAME_BAR } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayGameChatBarProps {
  chat: Omit<ComponentProps<typeof PlayChat>, 'isSide' | 'onFold' | 'feed' | 'crowd'>
  // Absent in a lobby
  crowd?: { players: PlayFace[]; spectators: PlayFace[] }
  feed?: ReactNode
}

/**
 * Phone chat bar: bubbles above, hide key left, feed key right
 * @param {PlayGameChatBarProps} props - Chat, crowd and feed
 * @return {JSX.Element}
 */

export const PlayGameChatBar = ({ chat, crowd, feed }: PlayGameChatBarProps) => {
  const { lines, add } = usePlayChatLines(chat.sessionId, chat.messages)
  const { draft, setDraft, onKeyDown } = usePlayChatDraft(chat.sessionId, add)
  const bubbles = usePlayBubbles(lines)
  const [isShown, setShown] = useState(true)
  const [isSheetOpen, setSheetOpen] = useState(false)
  const BubblesIcon = isShown ? ICONS.playChat : ICONS.hidden
  const FeedIcon = ICONS.playFeed

  return (
    <>
      <div className={PLAY_GAME_BAR.bar}>
        {isShown && bubbles.length > 0 && (
          <ul className={PLAY_GAME_BAR.bubbles} aria-live="polite">
            {bubbles.map((line) => (
              <li key={line.id} className={PLAY_GAME_BAR.bubble}>
                <Avatar name={line.author.name} src={line.author.avatarUrl} size="xs" />
                <span>
                  <span className={PLAY_GAME_BAR.bubbleName}>{line.author.name}</span> {line.body}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className={cn(PLAY_GAME_BAR.key, !isShown && PLAY_GAME_BAR.keyOff)}
          aria-label={PLAY_MOBILE_COPY.chatBubbles}
          aria-pressed={isShown}
          onClick={() => setShown((value) => !value)}
        >
          <BubblesIcon className={PLAY_GAME_BAR.keyIcon} aria-hidden="true" />
        </button>
        <textarea
          rows={1}
          value={draft}
          placeholder={PLAY_HUB_COPY.chatPlaceholder}
          aria-label={PLAY_HUB_COPY.chatPlaceholder}
          className={PLAY_GAME_BAR.input}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className={PLAY_GAME_BAR.key}
          aria-label={PLAY_MOBILE_COPY.chatFeed}
          onClick={() => setSheetOpen(true)}
        >
          <FeedIcon className={PLAY_GAME_BAR.keyIcon} aria-hidden="true" />
        </button>
      </div>

      <BottomSheet
        open={isSheetOpen}
        onClose={() => setSheetOpen(false)}
        title={PLAY_MOBILE_COPY.chatFeed}
      >
        <PlayChat
          {...chat}
          messages={lines}
          isSide
          crowd={crowd}
          feed={feed}
          initialTab={feed ? 'feed' : undefined}
        />
      </BottomSheet>
    </>
  )
}
