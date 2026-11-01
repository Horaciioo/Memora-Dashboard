'use client'

import { TermInput } from '@/composites/moderation/offense/TermInput'
import { ICONS } from '@/declarations/ui/icons'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_DETECTION_COPY } from '@/declarations/sanctions/detection'
import { DETECTION_PANEL } from '@/declarations/ui/variants'
import { KEYWORD_SEPARATOR, addTerms } from '@/core/lib/modview/terms'
import { cn } from '@/utils/classnames'

export interface KeywordFieldProps {
  words: string[]
  canManage: boolean
  onChange: (words: string[]) => void
}

/**
 * Detection words as removable chips
 * @param {KeywordFieldProps} props - Words and handler
 * @return {JSX.Element}
 */

export const KeywordField = ({ words, canManage, onChange }: KeywordFieldProps) => {
  const Close = ICONS.close

  return (
    <div className="flex flex-col gap-3">
      {words.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-subtle)] italic">
          {SANCTION_DETECTION_COPY.wordsEmpty}
        </p>
      ) : (
        <ul className={DETECTION_PANEL.chips}>
          {words.map((word) => (
            <li
              key={word}
              className={cn(DETECTION_PANEL.chip, !canManage && DETECTION_PANEL.chipPlain)}
            >
              {word}
              {canManage && (
                <button
                  type="button"
                  className={DETECTION_PANEL.chipRemove}
                  aria-label={SANCTION_DETECTION_COPY.removeWord.replace('{word}', word)}
                  onClick={() => onChange(words.filter((other) => other !== word))}
                >
                  <Close className={DETECTION_PANEL.chipIcon} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <>
          <TermInput
            placeholder={SANCTION_DETECTION_COPY.wordsPlaceholder}
            maxLength={FORM_SETTINGS.titleMaxLength}
            onAdd={(raw) =>
              onChange(addTerms(words, raw, KEYWORD_SEPARATOR, FORM_SETTINGS.longTextMaxLength))
            }
          />
          <p className="text-xs text-[var(--color-ink-subtle)]">
            {SANCTION_DETECTION_COPY.wordsHint}
          </p>
        </>
      )}
    </div>
  )
}
