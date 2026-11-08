'use client'

import { useEffect, useRef, useState } from 'react'

import { ThemeIconButton } from '@/components/elements/actions/ThemeIconButton'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { WELCOME_COPY } from '@/declarations/onboarding/welcome'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface WelcomeBarProps {
  // Open to the person's own words
  isOpen: boolean
  isBusy: boolean
  onSend: (text: string) => void
}

/**
 * The chat bar under the talk, it opens when Memora asks for words
 * @param {boolean} isOpen - The person may write
 * @param {boolean} isBusy - An answer is in flight
 * @param {(text: string) => void} onSend - Words sent
 * @return {JSX.Element}
 */

export const WelcomeBar = ({ isOpen, isBusy, onSend }: WelcomeBarProps) => {
  const field = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState('')
  // The glow ends once the pointer has been on the bar
  const [isTouched, setTouched] = useState(false)

  // The bar takes the focus as it opens
  useEffect(() => {
    if (isOpen) field.current?.focus()
  }, [isOpen])

  const send = () => {
    const body = text.trim()
    if (!body) return

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
          <textarea
            ref={field}
            rows={1}
            value={text}
            maxLength={FORM_SETTINGS.shortTextMaxLength}
            placeholder={WELCOME_COPY.pseudoPlaceholder}
            aria-label={TOUR_COPY.inputLabel}
            disabled={isBusy}
            className={TOUR_CHAT.barField}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                send()
              }
            }}
          />
        ) : (
          <p className={cn(TOUR_CHAT.barText, TOUR_CHAT.barPlaceholder)}>
            {TOUR_COPY.inputPlaceholder}
          </p>
        )}
      </div>
    </div>
  )
}
