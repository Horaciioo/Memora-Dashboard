'use client'

import type { AssistantChat } from '@/core/hooks/data/system/useAssistantChat'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_STYLES, BUTTON_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface AssistantAnswersProps {
  chat: AssistantChat
}

/**
 * Ways to answer Memora
 * @param {AssistantChat} chat - Conversation state
 * @return {JSX.Element | null}
 */

export const AssistantAnswers = ({ chat }: AssistantAnswersProps) => {
  const { current } = chat
  if (!current) return null

  // Pick one of the offered answers
  if (current.question?.kind === 'choice' && current.question.choices.length > 0) {
    return (
      <div className={ASSISTANT_STYLES.choices} role="group" aria-label={current.question.label}>
        {current.question.choices.map((choice) => (
          <button
            key={choice.value}
            type="button"
            onClick={() => chat.answer(choice.value, choice.label)}
            className={ASSISTANT_STYLES.choice}
          >
            <span className="min-w-0 truncate">{choice.label}</span>
            {choice.hint && <span className={ASSISTANT_STYLES.choiceHint}>{choice.hint}</span>}
          </button>
        ))}
      </div>
    )
  }

  if (!current.confirm) return null

  return (
    <div className={ASSISTANT_STYLES.actions}>
      <button
        type="button"
        autoFocus
        disabled={chat.isBusy}
        onClick={chat.confirm}
        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}
      >
        {ASSISTANT_COPY.confirm}
      </button>
      <button
        type="button"
        onClick={chat.reset}
        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.ghost)}
      >
        {ASSISTANT_COPY.cancel}
      </button>
    </div>
  )
}
