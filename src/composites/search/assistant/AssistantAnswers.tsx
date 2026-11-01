'use client'

import { Button } from '@/components/elements/actions/Button'
import { ScenarioPercent } from '@/composites/search/assistant/ScenarioPercent'
import { ScenarioMulti } from '@/composites/search/assistant/ScenarioMulti'
import { ScenarioSearch } from '@/composites/search/assistant/ScenarioSearch'
import { ScenarioPeriod } from '@/composites/search/assistant/ScenarioPeriod'
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
  const { ask } = chat.scenario

  // A guided talk waits for its own answer
  if (ask?.kind === 'period') {
    return (
      <ScenarioPeriod
        booked={ask.booked}
        focus={ask.focus}
        onPick={(value, label) => chat.scenario.answer({ value, label })}
      />
    )
  }

  if (ask?.kind === 'percent') {
    return (
      <ScenarioPercent
        value={ask.value}
        max={ask.max}
        onPick={(percent) =>
          chat.scenario.answer({ value: String(percent), label: `${percent} %` })
        }
      />
    )
  }

  if (ask?.kind === 'multi') {
    return (
      <ScenarioMulti
        choices={ask.choices}
        onPick={(value, label) => chat.scenario.answer({ value, label })}
      />
    )
  }

  if (ask?.kind === 'search') {
    return (
      <ScenarioSearch
        placeholder={ask.placeholder}
        onSearch={(text) => chat.scenario.answer({ value: text, label: text })}
      />
    )
  }

  if (ask?.kind === 'choices') {
    // Short answers are pills, answers with a detail are rows
    const isPlain = ask.choices.every((choice) => !choice.hint)

    return (
      <div className={isPlain ? ASSISTANT_STYLES.answers : ASSISTANT_STYLES.choices} role="group">
        {ask.choices.map((choice, index) =>
          isPlain ? (
            <Button
              key={choice.value}
              variant={index === 0 ? 'primary' : 'secondary'}
              className={ASSISTANT_STYLES.answer}
              onClick={() => chat.scenario.answer({ value: choice.value, label: choice.label })}
            >
              {choice.label}
            </Button>
          ) : (
            <button
              key={choice.value}
              type="button"
              onClick={() => chat.scenario.answer({ value: choice.value, label: choice.label })}
              className={ASSISTANT_STYLES.choice}
            >
              <span className="min-w-0 truncate">{choice.label}</span>
              <span className={ASSISTANT_STYLES.choiceHint}>{choice.hint}</span>
            </button>
          )
        )}
      </div>
    )
  }

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
