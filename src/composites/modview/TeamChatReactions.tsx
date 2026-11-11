'use client'

import { useCallback, useRef, useState } from 'react'

import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import {
  TEAM_CHAT_COPY as COPY,
  TEAM_CHAT_QUICK,
  TEAM_CHAT_REACTIONS,
} from '@/declarations/lives/teamChat'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_TEAM_CHAT as STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { LiveTeamMessage } from '@/types/lives'

const AddIcon = ICONS.emoji

export interface TeamChatReactionsProps {
  message: LiveTeamMessage
  viewerId: string
  names: Record<string, string>
  onReact: (messageId: string, emoji: string) => void
}

/**
 * Emoji left on a message, nothing when there are none
 * @param {TeamChatReactionsProps} props - Reactions props
 * @return {JSX.Element | null}
 */

export const TeamChatReactions = ({
  message,
  viewerId,
  names,
  onReact,
}: TeamChatReactionsProps) => {
  if (!message.reactions.length) return null

  return (
    <div className={STYLES.reactions}>
      {message.reactions.map(({ emoji, accountIds }) => {
        const mine = accountIds.includes(viewerId)
        const who = accountIds.map((id) =>
          id === viewerId ? COPY.you : (names[id] ?? COPY.unknown)
        )

        return (
          <button
            key={emoji}
            type="button"
            title={COPY.reactionOf.replace('{emoji}', emoji).replace('{names}', who.join(', '))}
            aria-pressed={mine}
            className={cn(STYLES.chip, mine && STYLES.chipMine)}
            onClick={() => onReact(message.id, emoji)}
          >
            <span>{emoji}</span>
            <span className="tabular-nums">{accountIds.length}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Floating bar over a hovered message, quick emoji then the full picker, like Discord
 * @param {{ messageId: string, onReact: (messageId: string, emoji: string) => void }} props - Bar props
 * @return {JSX.Element}
 */

export const TeamChatReactBar = ({
  messageId,
  onReact,
}: {
  messageId: string
  onReact: (messageId: string, emoji: string) => void
}) => {
  const [isPicking, setPicking] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const fold = useCallback(() => setPicking(false), [])
  useOutsideDismiss(isPicking, barRef, fold)

  return (
    <div ref={barRef} className={cn(STYLES.reactBar, isPicking && STYLES.reactBarOn)}>
      {TEAM_CHAT_QUICK.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={emoji}
          className={STYLES.pickerItem}
          onClick={() => onReact(messageId, emoji)}
        >
          {emoji}
        </button>
      ))}
      <span className={STYLES.reactDivider} aria-hidden="true" />
      <button
        type="button"
        aria-label={COPY.react}
        aria-expanded={isPicking}
        className={cn(STYLES.pickerItem, 'text-[var(--color-ink-subtle)]')}
        onClick={() => setPicking((open) => !open)}
      >
        <AddIcon className="size-4" aria-hidden="true" />
      </button>
      {isPicking && (
        <div className={STYLES.picker} role="listbox" aria-label={COPY.react}>
          {TEAM_CHAT_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="option"
              aria-selected={false}
              className={STYLES.pickerItem}
              onClick={() => {
                setPicking(false)
                onReact(messageId, emoji)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
