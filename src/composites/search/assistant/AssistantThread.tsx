'use client'

import { Fragment, useState } from 'react'
import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { WaveText } from '@/components/elements/display/WaveText'
import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { MemoraTyping } from '@/composites/search/assistant/MemoraTyping'
import { AssistantAnswers } from '@/composites/search/assistant/AssistantAnswers'
import { MemoraTurn } from '@/composites/search/assistant/MemoraTurn'
import { RecapSlide } from '@/composites/recap/RecapSlide'
import { PeopleGroups } from '@/composites/search/assistant/PeopleGroups'
import { WrittenList } from '@/composites/search/assistant/WrittenList'
import { SlotList } from '@/composites/search/assistant/SlotList'
import type { AssistantChat } from '@/core/hooks/data/system/useAssistantChat'
import { useRecapGuide } from '@/core/store/recapGuide'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { RECAP_SCENARIO_COPY } from '@/declarations/assistant/scenarios/recap'
import { ICONS } from '@/declarations/ui/icons'
import { ASSISTANT_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

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
  // Conversations the member reopened, the latest one is always open
  const [reopened, setReopened] = useState<number[]>([])
  const heads = chat.turns.flatMap((turn, index) => (turn.topic ? [index] : []))
  const headOf = (index: number) => heads.filter((head) => head <= index).at(-1) ?? -1
  const isFolded = (index: number) => {
    const head = headOf(index)

    return head >= 0 && head < (heads.at(-1) ?? -1) && !reopened.includes(head)
  }

  return (
    <div className={ASSISTANT_STYLES.thread} role="log" aria-live="polite">
      {opening}
      {chat.turns.map((turn, index) =>
        turn.topic ? (
          <button
            key={turn.id}
            type="button"
            aria-expanded={!isFolded(index)}
            onClick={() =>
              setReopened((list) =>
                list.includes(index) ? list.filter((head) => head !== index) : [...list, index]
              )
            }
            className={ASSISTANT_STYLES.topic}
          >
            <LinkGlyph
              className={cn(
                ASSISTANT_STYLES.topicGlyph,
                !isFolded(index) && ASSISTANT_STYLES.topicGlyphOpen
              )}
              aria-hidden="true"
            />
            {turn.topic}
          </button>
        ) : isFolded(index) ? null : turn.from === 'me' ? (
          <p key={turn.id} className={ASSISTANT_STYLES.mine}>
            {turn.text}
          </p>
        ) : (
          <Fragment key={turn.id}>
            <MemoraTurn
              text={turn.text}
              isFollow={chat.turns[index - 1]?.from === 'memora' && !chat.turns[index - 1]?.topic}
            >
              {turn.proposal && <SlotList slots={turn.proposal.slots} />}
              {turn.recap && <RecapSlide chapter={turn.recap} onNavigate={() => undefined} />}
              {turn.items && <WrittenList items={turn.items} />}
              {turn.groups && <PeopleGroups groups={turn.groups} />}
              {turn.card && (
                <div className={ASSISTANT_STYLES.card}>
                  <Avatar name={turn.card.name} src={turn.card.avatarUrl} size="lg" />
                  <div className="flex min-w-0 flex-col">
                    <span className={ASSISTANT_STYLES.cardName}>{turn.card.name}</span>
                    <span className={ASSISTANT_STYLES.cardId}>{turn.card.id}</span>
                  </div>
                </div>
              )}
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
          </Fragment>
        )
      )}
      {status === 'typing' && <MemoraTyping />}
      {chat.isBusy || status === 'thinking' || chat.scenario.preparing ? (
        <p className={ASSISTANT_STYLES.thinking} role="status">
          <BrainMark className={ASSISTANT_STYLES.avatarMark} />
          {chat.scenario.preparing ?? ASSISTANT_COPY.thinking}
        </p>
      ) : (
        <AssistantAnswers chat={chat} />
      )}
    </div>
  )
}
