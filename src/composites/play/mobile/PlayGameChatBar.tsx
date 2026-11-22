'use client'

import { useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { PlayChat } from '@/composites/play/session/PlayChat'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { usePlayBubbles } from '@/core/hooks/data/play/usePlayBubbles'
import { usePlayChatDraft } from '@/core/hooks/data/play/usePlayChatDraft'
import { usePlayChatLines } from '@/core/hooks/data/play/usePlayChatLines'
import { PLAY_HUB_COPY, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_HUD_SKINS } from '@/declarations/play/hud'
import type { PlayGameName } from '@/utils/constants/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_GAME_BAR } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayGameChatBarProps {
  chat: Omit<ComponentProps<typeof PlayChat>, 'isSide' | 'onFold' | 'feed' | 'crowd'>
  // Absent in a lobby
  crowd?: { players: PlayFace[]; spectators: PlayFace[] }
  feed?: ReactNode
  // Game with its own HUD skin, the feed sheet wears it
  game: PlayGameName
}

/**
 * Phone chat bar: bubbles above, hide key left, feed key right
 * @param {PlayGameChatBarProps} props - Chat, crowd, feed and game
 * @return {JSX.Element}
 */

export const PlayGameChatBar = ({ chat, crowd, feed, game }: PlayGameChatBarProps) => {
  const { lines, add } = usePlayChatLines(chat.sessionId, chat.messages)
  const { draft, setDraft, onKeyDown } = usePlayChatDraft(chat.sessionId, add)
  const bubbles = usePlayBubbles(lines)
  const [isShown, setShown] = useState(true)
  const [isSheetOpen, setSheetOpen] = useState(false)
  const BubblesIcon = isShown ? ICONS.playChat : ICONS.hidden
  const FeedIcon = ICONS.playFeed
  // The bar and its bubbles wear the game's HUD skin
  const skin = PLAY_HUD_SKINS.get(game)
  const hud = game.toLowerCase()

  return (
    <>
      <div data-hud={hud} className={cn(PLAY_GAME_BAR.bar, skin)}>
        {isShown && bubbles.length > 0 && (
          <ul className={PLAY_GAME_BAR.bubbles} aria-live="polite">
            {bubbles.map((line) => (
              <li key={line.id} className={cn(PLAY_GAME_BAR.bubble, skin)}>
                <PlayAvatar
                  accountId={line.author.id}
                  name={line.author.name}
                  src={line.author.avatarUrl}
                  size="xs"
                />
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
        hud={skin ? hud : undefined}
      >
        <PlayChat
          {...chat}
          skin={skin}
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
