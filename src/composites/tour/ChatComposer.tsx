'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { MultiSelect } from '@/components/elements/forms/MultiSelect'
import { BirthdayPicker } from '@/composites/tour/BirthdayPicker'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { useAppearanceStore } from '@/core/store/appearance'
import { useColorVisionStore } from '@/core/store/colorVision'
import { useThemeStore } from '@/core/store/theme'
import {
  COLOR_VISION_REGISTRY,
  FONT_SCALE_REGISTRY,
  THEME_REGISTRY,
} from '@/declarations/access/preferences'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { LANGUAGE_OPTIONS } from '@/declarations/system/locales'
import type { ChatAsk } from '@/declarations/tour/chat'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import { formatDay } from '@/utils/format/dates'

export interface ChatComposerProps {
  ask: ChatAsk
  onAnswer: (text: string, patch?: IntakeAnswers) => void
}

/**
 * One answer a click sends
 * @typedef {Object} Choice
 * @property {string} key - Identifier
 * @property {string} label - Button and reply
 * @property {IntakeAnswers} [patch] - Answers it records
 * @property {() => void} [apply] - Effect on the app
 */

interface Choice {
  key: string
  label: string
  patch?: IntakeAnswers
  apply?: () => void
}

/**
 * Where Memora is answered: the control matching her question, then send
 * @param {ChatComposerProps} props - Question and handler
 * @return {JSX.Element}
 */

export const ChatComposer = ({ ask, onAnswer }: ChatComposerProps) => {
  const setTheme = useThemeStore((state) => state.setTheme)
  const setFontScale = useAppearanceStore((state) => state.setFontScale)
  const setColorVision = useColorVisionStore((state) => state.setColorVisionMode)
  const [birthday, setBirthday] = useState('')
  const [languages, setLanguages] = useState<string[]>([])

  // Questions answered by one click
  const choices: Partial<Record<ChatAsk, Choice[]>> = {
    celebrate: [
      { key: 'yes', label: TOUR_COPY.yes, patch: { celebrateBirthday: true } },
      { key: 'no', label: TOUR_COPY.no, patch: { celebrateBirthday: false } },
    ],
    theme: THEME_REGISTRY.keys.map((key) => ({
      key,
      label: THEME_REGISTRY.get(key).label,
      apply: () => setTheme(key),
    })),
    fontScale: FONT_SCALE_REGISTRY.keys.map((key) => ({
      key,
      label: FONT_SCALE_REGISTRY.get(key).label,
      apply: () => setFontScale(key),
    })),
    colorVision: COLOR_VISION_REGISTRY.keys.map((key) => ({
      key,
      label: COLOR_VISION_REGISTRY.get(key).short,
      apply: () => setColorVision(key),
    })),
    ready: [{ key: 'ready', label: TOUR_COPY.ready }],
  }

  const clicks = choices[ask]
  if (clicks) {
    return (
      <div className={TOUR_CHAT.composer}>
        <div className={TOUR_CHAT.choices}>
          {clicks.map((choice) => (
            <Button
              key={choice.key}
              variant={ask === 'ready' ? 'primary' : 'secondary'}
              onClick={() => {
                choice.apply?.()
                onAnswer(choice.label, choice.patch)
              }}
            >
              {choice.label}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const isBirthday = ask === 'birthday'

  return (
    <div className={TOUR_CHAT.composer}>
      <div className={TOUR_CHAT.field}>
        {isBirthday ? (
          <BirthdayPicker onChange={setBirthday} />
        ) : (
          <MultiSelect
            id="tour-languages"
            options={LANGUAGE_OPTIONS}
            value={languages}
            onChange={setLanguages}
            label={TOUR_COPY.languagesLabel}
            emptyLabel={TOUR_COPY.languagesEmpty}
            maxItems={FORM_SETTINGS.tagMaxCount}
          />
        )}
      </div>
      <div className={TOUR_CHAT.send}>
        <Button
          variant="primary"
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
        <Button
          variant="ghost"
          onClick={() => onAnswer(isBirthday ? TOUR_COPY.skipBirthday : TOUR_COPY.skip)}
        >
          {isBirthday ? TOUR_COPY.skipBirthday : TOUR_COPY.skip}
        </Button>
      </div>
    </div>
  )
}
