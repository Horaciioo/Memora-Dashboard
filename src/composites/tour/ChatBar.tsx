'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ThemeIconButton } from '@/components/elements/actions/ThemeIconButton'
import { ChatTimer } from '@/composites/tour/ChatTimer'
import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { ChatAsk } from '@/declarations/tour/chat'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ChatBarProps {
  // What is written in it so far for the member
  draft: string
  // Wait before the next part, nothing when none
  holdMs: number | null
  // Question waiting, the bar opens to the member for the one that needs his words
  ask: ChatAsk | null
  onSend: (text: string) => void
}

/**
 * The member's chat bar, the theme switch on its left and the countdown to the next part on its right: it writes his questions for him, and opens to his own words when Memora asks for them
 * @param {ChatBarProps} props - Text written so far, the wait and the question
 * @return {JSX.Element}
 */

export const ChatBar = ({ draft, holdMs, ask, onSend }: ChatBarProps) => {
  const isOpen = ask === 'hurdleNote' || ask === 'hurdleWrite'
  const isWriting = draft.length > 0
  const field = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState('')
  // The glow ends once the pointer has been on the bar
  const [isTouched, setTouched] = useState(false)
  const { run, isSaving } = useMutation()

  // The bar takes the focus as it opens
  useEffect(() => {
    if (isOpen) field.current?.focus()
  }, [isOpen])

  // One line, taller only as the text is
  useEffect(() => {
    const area = field.current
    if (!area) return

    area.style.height = 'auto'
    area.style.height = `${area.scrollHeight}px`
  }, [text, isOpen])

  // Kept on the member's file as a note of the system, then sent in the thread
  const send = async () => {
    const body = text.trim()
    if (!body) return

    const saved = await run(() => apiPost(API_ROUTES.tourHurdle, { body }))
    if (!saved) return

    setText('')
    onSend(body)
  }

  return (
    <div className={TOUR_CHAT.bar}>
      <ThemeIconButton className={TOUR_CHAT.barTheme} />
      <div
        className={cn(
          TOUR_CHAT.barBox,
          isOpen && TOUR_CHAT.barBoxOpen,
          isOpen && !isTouched && TOUR_CHAT.barGlow
        )}
        onPointerEnter={() => setTouched(true)}
        role="group"
        aria-label={TOUR_COPY.inputLabel}
      >
        {isOpen ? (
          <>
            <textarea
              ref={field}
              rows={1}
              value={text}
              maxLength={FORM_SETTINGS.noteMaxLength}
              placeholder={TOUR_COPY.inputHurdlePlaceholder}
              aria-label={TOUR_COPY.inputLabel}
              disabled={isSaving}
              className={TOUR_CHAT.barField}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void send()
                }
              }}
            />
            <Button
              variant="primary"
              aria-label={TOUR_COPY.inputSend}
              disabled={text.trim() === ''}
              isLoading={isSaving}
              onClick={() => void send()}
            >
              {TOUR_COPY.send}
            </Button>
          </>
        ) : (
          <>
            <p className={cn(TOUR_CHAT.barText, !isWriting && TOUR_CHAT.barPlaceholder)}>
              {isWriting ? draft : holdMs ? TOUR_COPY.inputWaiting : TOUR_COPY.inputPlaceholder}
              {isWriting && <span className={TOUR_CHAT.barCaret} aria-hidden="true" />}
            </p>
            {holdMs && <ChatTimer key={holdMs} ms={holdMs} />}
          </>
        )}
      </div>
    </div>
  )
}
