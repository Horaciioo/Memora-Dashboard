'use client'

import type { ReactNode } from 'react'

import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { AssistantAnswers } from '@/composites/search/assistant/AssistantAnswers'
import { MemoraTurn } from '@/composites/search/assistant/MemoraTurn'
import { SlotList } from '@/composites/search/assistant/SlotList'
import type { AssistantChat } from '@/core/hooks/data/system/useAssistantChat'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
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

export const AssistantThread = ({ chat, onSuggestion, opening }: AssistantThreadProps) => (
  <div className={ASSISTANT_STYLES.thread} role="log" aria-live="polite">
    {opening}
    {chat.turns.map((turn, index) =>
      turn.from === 'me' ? (
        <p key={turn.id} className={ASSISTANT_STYLES.mine}>
          {turn.text}
        </p>
      ) : (
        <MemoraTurn key={turn.id} text={turn.text}>
          {turn.proposal && <SlotList slots={turn.proposal.slots} />}
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
    {chat.isBusy ? (
      <p className={ASSISTANT_STYLES.thinking} role="status">
        <BrainMark className={ASSISTANT_STYLES.avatarMark} />
        {ASSISTANT_COPY.thinking}
      </p>
    ) : (
      <AssistantAnswers chat={chat} />
    )}
  </div>
)
