'use client'

import { TermBox } from '@/composites/modview/TermBox'
import { WordForm } from '@/composites/modview/WordForm'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { sanitizeWords } from '@/core/lib/modview/personal'
import { MODVIEW_PERSONAL, MODVIEW_PERSONAL_COPY } from '@/declarations/modview/personal'
import { MODVIEW_TERMS, OFFENSE_SHEET } from '@/declarations/ui/variants'

/**
 * Up to five words whose repeated lines get counted in the chat
 * @return {JSX.Element}
 */

export const RepeatWordsEditor = () => {
  const { preferences, update } = useModPreferences()
  const words = preferences.repeatWords
  const { maxRepeatWords } = MODVIEW_PERSONAL

  return (
    <div className={OFFENSE_SHEET.block}>
      <span className={OFFENSE_SHEET.label}>{MODVIEW_PERSONAL_COPY.repeatHead}</span>
      <p className={MODVIEW_TERMS.hint}>
        {MODVIEW_PERSONAL_COPY.repeatHint.replace('{max}', String(maxRepeatWords))}
      </p>
      <WordForm
        placeholder={MODVIEW_PERSONAL_COPY.repeatPlaceholder}
        isFull={words.length >= maxRepeatWords}
        onAdd={(term) =>
          update({ repeatWords: sanitizeWords([...words, term], maxRepeatWords) ?? words })
        }
      />
      <ul className={MODVIEW_TERMS.list}>
        {words.map((word) => (
          <TermBox
            key={word}
            term={word}
            onRemove={() => update({ repeatWords: words.filter((entry) => entry !== word) })}
          />
        ))}
      </ul>
    </div>
  )
}
