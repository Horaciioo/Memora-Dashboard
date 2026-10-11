'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Textarea } from '@/components/elements/forms/Textarea'
import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'

export interface HurdleReplyProps {
  onAnswer: (text: string, patch?: IntakeAnswers) => void
}

/**
 * What could slow the moderation, written once and kept as a note on the member's file
 * @param {HurdleReplyProps} props - Handler
 * @return {JSX.Element}
 */

export const HurdleReply = ({ onAnswer }: HurdleReplyProps) => {
  const { run, isSaving } = useMutation()
  const [body, setBody] = useState('')

  const send = async () => {
    const saved = await run(() => apiPost(API_ROUTES.tourHurdle, { body }))
    if (saved) onAnswer(body.trim())
  }

  return (
    <div className={TOUR_CHAT.reply}>
      <p className={TOUR_CHAT.embedTitle}>{TOUR_COPY.hurdleLabel}</p>
      <Textarea
        rows={5}
        value={body}
        maxLength={FORM_SETTINGS.noteMaxLength}
        placeholder={TOUR_COPY.hurdlePlaceholder}
        aria-label={TOUR_COPY.hurdleLabel}
        disabled={isSaving}
        onChange={(event) => setBody(event.target.value)}
      />
      <div className={TOUR_CHAT.replyActions}>
        <Button
          variant="primary"
          className={TOUR_CHAT.replyAction}
          disabled={body.trim() === ''}
          isLoading={isSaving}
          onClick={() => void send()}
        >
          {TOUR_COPY.send}
        </Button>
      </div>
    </div>
  )
}
