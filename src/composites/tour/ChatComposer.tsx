'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { MultiSelect } from '@/components/elements/forms/MultiSelect'
import { BirthdayPicker } from '@/composites/tour/BirthdayPicker'
import { HurdleReply } from '@/composites/tour/HurdleReply'
import { LookChoices } from '@/composites/tour/LookChoices'
import { VisionChoices } from '@/composites/tour/VisionChoices'
import { SocialsReply } from '@/composites/tour/SocialsReply'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { LANGUAGE_OPTIONS } from '@/declarations/system/locales'
import type { ChatAsk } from '@/declarations/tour/chat'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import type { ButtonVariant } from '@/declarations/ui/variants'
import type { FieldDefinition } from '@/types/forms'
import { formatDay } from '@/utils/format/dates'

export interface ChatComposerProps {
  ask: ChatAsk
  socialFields: FieldDefinition[]
  // Waits for something before the click counts
  isLocked?: boolean
  onAnswer: (text: string, patch?: IntakeAnswers) => void
}

/**
 * One answer a click sends
 * @typedef {Object} Choice
 * @property {string} key - Identifier
 * @property {string} label - Button and reply
 * @property {IntakeAnswers} [patch] - Answers it records
 * @property {() => void} [apply] - Effect on the app
 * @property {ButtonVariant} [variant] - Tone of its button
 */

interface Choice {
  key: string
  label: string
  patch?: IntakeAnswers
  apply?: () => void
  variant?: ButtonVariant
}

/**
 * Where Memora is answered, in the thread: the control matching her question, then send
 * @param {ChatComposerProps} props - Question, social form, lock and handler
 * @return {JSX.Element}
 */

export const ChatComposer = ({
  ask,
  socialFields,
  isLocked = false,
  onAnswer,
}: ChatComposerProps) => {
  const [birthday, setBirthday] = useState('')
  const [languages, setLanguages] = useState<string[]>([])

  // Questions answered by one click
  const choices: Partial<Record<ChatAsk, Choice[]>> = {
    celebrate: [
      {
        key: 'yes',
        label: TOUR_COPY.yes,
        patch: { celebrateBirthday: true },
        variant: 'success',
      },
      {
        key: 'no',
        label: TOUR_COPY.no,
        patch: { celebrateBirthday: false },
        variant: 'danger',
      },
    ],
    hurdle: [
      { key: 'yes', label: TOUR_COPY.hurdleYes, patch: { hurdle: true }, variant: 'secondary' },
      { key: 'no', label: TOUR_COPY.hurdleNo, patch: { hurdle: false }, variant: 'primary' },
    ],
    colorBlind: [
      {
        key: 'yes',
        label: TOUR_COPY.colorBlindYes,
        patch: { colorBlind: true },
        variant: 'success',
      },
      { key: 'no', label: TOUR_COPY.colorBlindNo, patch: { colorBlind: false }, variant: 'danger' },
    ],
    ready: [{ key: 'ready', label: TOUR_COPY.ready }],
  }

  if (ask === 'theme' || ask === 'fontScale') return <LookChoices kind={ask} onAnswer={onAnswer} />
  if (ask === 'colorVision') return <VisionChoices onAnswer={onAnswer} />
  if (ask === 'hurdleNote') return <HurdleReply onAnswer={onAnswer} />
  if (ask === 'socials') return <SocialsReply fields={socialFields} onAnswer={onAnswer} />

  const clicks = choices[ask]
  if (clicks) {
    return (
      <div className={TOUR_CHAT.quick}>
        {clicks.map((choice) => (
          <Button
            key={choice.key}
            variant={choice.variant ?? (ask === 'ready' ? 'primary' : 'secondary')}
            disabled={isLocked}
            className={TOUR_CHAT.chip}
            onClick={() => {
              choice.apply?.()
              onAnswer(choice.label, choice.patch)
            }}
          >
            {choice.label}
          </Button>
        ))}
      </div>
    )
  }

  const isBirthday = ask === 'birthday'

  return (
    <div className={TOUR_CHAT.reply}>
      <p className={TOUR_CHAT.embedTitle}>
        {isBirthday ? TOUR_COPY.birthdayLabel : TOUR_COPY.languagesLabel}
      </p>
      <div className={TOUR_CHAT.field}>
        {isBirthday ? (
          <BirthdayPicker onChange={setBirthday} />
        ) : (
          <MultiSelect
            id="tour-languages"
            options={LANGUAGE_OPTIONS}
            mark="flag"
            value={languages}
            onChange={setLanguages}
            label={TOUR_COPY.languagesLabel}
            emptyLabel={TOUR_COPY.languagesEmpty}
            maxItems={FORM_SETTINGS.tagMaxCount}
          />
        )}
      </div>
      <div className={TOUR_CHAT.replyActions}>
        <Button
          variant="primary"
          className={TOUR_CHAT.replyAction}
          disabled={isBirthday ? !birthday : languages.length === 0}
          onClick={() =>
            isBirthday
              ? onAnswer(formatDay(birthday), { birthday })
              : onAnswer(
                  LANGUAGE_OPTIONS.filter((option) => languages.includes(option.value))
                    .map((option) => option.label)
                    .join(', '),
                  { languages }
                )
          }
        >
          {TOUR_COPY.send}
        </Button>
        <span className={TOUR_CHAT.replyDivider} role="separator" />
        <Button
          variant="ghost"
          className={TOUR_CHAT.replyAction}
          onClick={() => onAnswer(isBirthday ? TOUR_COPY.skipBirthday : TOUR_COPY.skip)}
        >
          {isBirthday ? TOUR_COPY.skipBirthday : TOUR_COPY.skip}
        </Button>
      </div>
    </div>
  )
}
