'use client'

import { useEffect, useRef, useState } from 'react'

import { ChatText } from '@/composites/modview/ChatText'
import { threadAround } from '@/core/lib/modview/thread'
import type { SuggestionSource } from '@/core/lib/modview/suggest'
import { MODVIEW_SUGGESTION_COPY as COPY, THREAD_CONTEXT } from '@/declarations/modview/suggestions'
import { MODVIEW_SUGGEST } from '@/declarations/ui/variants'
import type { ChatMessage } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { chatColour } from '@/utils/format/chatColour'
import { formatClock } from '@/utils/format/modview'

export interface SuggestionThreadProps {
  messages: ChatMessage[]
  source: SuggestionSource
}

/**
 * The chat around a suggested message, as Twitch lays it out
 * @param {ChatMessage[]} messages - Chat of the live
 * @param {SuggestionSource} source - Message pointed at
 * @return {JSX.Element}
 */

export const SuggestionThread = ({ messages, source }: SuggestionThreadProps) => {
  const [before, setBefore] = useState(THREAD_CONTEXT)
  const [after, setAfter] = useState(THREAD_CONTEXT)
  const litRef = useRef<HTMLParagraphElement>(null)
  const { lines, hasOlder, hasNewer } = threadAround(messages, source, before, after)

  // The message is brought into view once, when the thread opens
  useEffect(() => {
    litRef.current?.scrollIntoView({ block: 'center' })
  }, [])

  if (lines.length === 0) return <p className={MODVIEW_SUGGEST.threadEmpty}>{COPY.threadEmpty}</p>

  return (
    <div className={MODVIEW_SUGGEST.thread}>
      {hasOlder && (
        <button
          type="button"
          className={MODVIEW_SUGGEST.more}
          onClick={() => setBefore((count) => count + THREAD_CONTEXT)}
        >
          {COPY.olderLines}
        </button>
      )}
      {lines.map((line) => {
        const isLit = line.id === source.id
        return (
          <p
            key={line.id}
            ref={isLit ? litRef : undefined}
            className={cn(MODVIEW_SUGGEST.line, isLit && MODVIEW_SUGGEST.lineLit)}
          >
            <time dateTime={line.sentAt} className={MODVIEW_SUGGEST.lineTime}>
              {formatClock(line.sentAt)}
            </time>
            <span className={MODVIEW_SUGGEST.lineName} style={{ color: chatColour(line.author) }}>
              {line.author.name}
            </span>
            <span>: </span>
            <span className={cn(line.deletedBy && MODVIEW_SUGGEST.lineGone)}>
              <ChatText text={line.text} fragments={line.fragments} flagged={line.flagged} />
            </span>
          </p>
        )
      })}
      {hasNewer && (
        <button
          type="button"
          className={MODVIEW_SUGGEST.more}
          onClick={() => setAfter((count) => count + THREAD_CONTEXT)}
        >
          {COPY.newerLines}
        </button>
      )}
    </div>
  )
}
