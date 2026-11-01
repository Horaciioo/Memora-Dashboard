'use client'

import type { ReactNode } from 'react'

import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { MemoraTyping } from '@/composites/search/assistant/MemoraTyping'
import { AssistantAnswers } from '@/composites/search/assistant/AssistantAnswers'
import { MemoraTurn } from '@/composites/search/assistant/MemoraTurn'
import { SlotList } from '@/composites/search/assistant/SlotList'
import type { AssistantChat } from '@/core/hooks/data/system/useAssistantChat'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ICONS } from '@/declarations/ui/icons'
import { ASSISTANT_STYLES } from '@/declarations/ui/variants'

export interface AssistantThreadProps {
  chat: AssistantChat
  onSuggestion: (text: string) => void
  // Line before the conversation
  opening?: ReactNode
}

/**
 * Conversation with Memora
 * @param {AssistantChat} chat - Conversation state
 * @param {(text: string) => void} onSuggestion - Sends an example
 * @param {ReactNode} [opening] - First line
 * @return {JSX.Element}
 */

export const AssistantThread = ({ chat, onSuggestion, opening }: AssistantThreadProps) => {
  const LinkGlyph = ICONS.forward
  const { status } = chat.scenario

  return (
    <div className={ASSISTANT_STYLES.thread} role="log" aria-live="polite">
      {opening}
      {chat.turns.map((turn, index) =>
        turn.from === 'me' ? (
          <p key={turn.id} className={ASSISTANT_STYLES.mine}>
            {turn.text}
          </p>
        ) : (
          <MemoraTurn
            key={turn.id}
            text={turn.text}
            isFollow={chat.turns[index - 1]?.from === 'memora'}
          >
            {turn.proposal && <SlotList slots={turn.proposal.slots} />}
            {turn.link && (
              <button
                type="button"
                onClick={() => chat.open(turn.link?.href ?? '')}
                className={ASSISTANT_STYLES.link}
              >
                <span className="min-w-0 truncate">{turn.link.label}</span>
                <LinkGlyph className={ASSISTANT_STYLES.linkGlyph} aria-hidden="true" />
              </button>
            )}
            {index === chat.turns.length - 1 &&
              turn.proposal?.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSuggestion(suggestion)}
                  className={ASSISTANT_STYLES.suggestion}
                >
                  {suggestion}
                </button>
              ))}
          </MemoraTurn>
        )
      )}
      {status === 'typing' && <MemoraTyping />}
      {chat.isBusy || status === 'thinking' ? (
        <p className={ASSISTANT_STYLES.thinking} role="status">
          <BrainMark className={ASSISTANT_STYLES.avatarMark} />
          {ASSISTANT_COPY.thinking}
        </p>
      ) : (
        <AssistantAnswers chat={chat} />
      )}
    </div>
  )
}
