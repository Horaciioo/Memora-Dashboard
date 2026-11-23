'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { RecapAgenda } from '@/composites/intelligence/RecapAgenda'
import { RecapNotebooks } from '@/composites/recap/RecapNotebooks'
import { AssistantThread } from '@/composites/search/assistant/AssistantThread'
import { useFitHeight } from '@/core/hooks/interaction/layout/measure/useFitHeight'
import { useAssistantChat } from '@/core/hooks/data/system/useAssistantChat'
import { cn } from '@/utils/classnames'
import { useAssistantDock } from '@/core/store/assistantDock'
import { INTELLIGENCE_COPY } from '@/declarations/intelligence/copy'
import { INTELLIGENCE_STYLES } from '@/declarations/ui/variants'

export interface IntelligenceHeroProps {
  title: string
}

/**
 * Greeting and composer of Memora Intelligence
 * @param {string} title - Greeting of the day
 * @return {JSX.Element}
 */

export const IntelligenceHero = ({ title }: IntelligenceHeroProps) => {
  const router = useRouter()
  const chat = useAssistantChat((href) => router.push(href))
  const [term, setTerm] = useState('')
  const thread = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLDivElement>(null)
  const isTalking = chat.turns.length > 0
  // The composer ends at the window's bottom, never below it
  const fitted = useFitHeight(hero, isTalking)
  const tail = chat.turns.at(-1)?.text.length ?? 0

  // Newest line in sight
  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight, behavior: 'smooth' })
  }, [isTalking, chat.turns.length, chat.scenario.status, tail])

  // Words asked from elsewhere, the palette for one, are answered here
  const pending = useAssistantDock((state) => state.pending)
  useEffect(() => {
    if (!pending) return

    useAssistantDock.getState().takePending()
    chat.start(pending)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  // A talk a bubble handed over starts right here
  const carried = useAssistantDock((state) => state.carried)
  useEffect(() => {
    if (!carried) return

    const focus = useAssistantDock.getState().takeCarried()
    if (focus) chat.guide(focus.scenario, focus.entry, focus.data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carried])

  const submit = (text: string) => {
    if (!text.trim()) return

    chat.start(text.trim())
    setTerm('')
  }

  return (
    <div
      ref={hero}
      style={fitted ? { height: fitted } : undefined}
      data-talking={isTalking || undefined}
      className={cn(INTELLIGENCE_STYLES.hero, isTalking && INTELLIGENCE_STYLES.heroChat)}
    >
      {!isTalking && (
        <h1 className={INTELLIGENCE_STYLES.title}>
          <BrainMark className={INTELLIGENCE_STYLES.titleMark} />
          {title}
        </h1>
      )}
      {isTalking && (
        <RecapAgenda onPick={(chapter) => chat.guide('recap', 'chapter', { chapter })} />
      )}
      {isTalking && (
        <div ref={thread} className={INTELLIGENCE_STYLES.thread}>
          <div className={INTELLIGENCE_STYLES.column}>
            <AssistantThread chat={chat} onSuggestion={(text) => chat.start(text)} />
          </div>
        </div>
      )}
      <div className={INTELLIGENCE_STYLES.dockWrap}>
        <form
          className={INTELLIGENCE_STYLES.composer}
          onSubmit={(event) => {
            event.preventDefault()
            submit(term)
          }}
        >
          <textarea
            rows={1}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={(event) => {
              // Enter sends
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit(term)
              }
            }}
            placeholder={INTELLIGENCE_COPY.placeholder}
            aria-label={INTELLIGENCE_COPY.placeholder}
            className={INTELLIGENCE_STYLES.input}
          />
          <Button
            type="submit"
            variant="primary"
            icon="forward"
            disabled={!term.trim()}
            aria-label={INTELLIGENCE_COPY.send}
          />
        </form>
      </div>
      {!isTalking && (
        <div className={INTELLIGENCE_STYLES.notebooks}>
          <RecapNotebooks tell={chat.guide} />
        </div>
      )}
    </div>
  )
}
