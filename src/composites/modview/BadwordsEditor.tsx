'use client'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { ColourField } from '@/components/elements/forms/pickers/ColourField'
import { TermBox } from '@/composites/modview/TermBox'
import { WordForm } from '@/composites/modview/WordForm'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { sanitizeBadwords } from '@/core/lib/modview/personal'
import { MODVIEW_PERSONAL, MODVIEW_PERSONAL_COPY } from '@/declarations/modview/personal'
import { MODVIEW_TERMS, OFFENSE_SHEET } from '@/declarations/ui/variants'
import type { ModBadword } from '@/types/modview'

/**
 * The moderator's own badwords: colour in the queue, optional suggestion
 * @return {JSX.Element}
 */

export const BadwordsEditor = () => {
  const { preferences, update } = useModPreferences()
  const badwords = preferences.badwords
  const { maxBadwords } = MODVIEW_PERSONAL

  const change = (term: string, patch: Partial<ModBadword>) =>
    update({
      badwords: badwords.map((badword) =>
        badword.term === term ? { ...badword, ...patch } : badword
      ),
    })

  return (
    <div className={OFFENSE_SHEET.block}>
      <span className={OFFENSE_SHEET.label}>{MODVIEW_PERSONAL_COPY.badwordHead}</span>
      <p className={MODVIEW_TERMS.hint}>{MODVIEW_PERSONAL_COPY.badwordHint}</p>
      <WordForm
        placeholder={MODVIEW_PERSONAL_COPY.badwordPlaceholder}
        isFull={badwords.length >= maxBadwords}
        onAdd={(term) =>
          update({
            badwords:
              sanitizeBadwords(
                [...badwords, { term, colour: null, isSuggested: false }],
                maxBadwords
              ) ?? badwords,
          })
        }
      />
      {badwords.length === 0 ? (
        <p className={OFFENSE_SHEET.placeholder}>{MODVIEW_PERSONAL_COPY.badwordEmpty}</p>
      ) : (
        <ul className={MODVIEW_TERMS.list}>
          {badwords.map((badword) => (
            <TermBox
              key={badword.term}
              term={badword.term}
              onRemove={() =>
                update({ badwords: badwords.filter((entry) => entry.term !== badword.term) })
              }
            >
              <ColourField
                id={`badword-colour-${badword.term}`}
                hasWheel
                label={MODVIEW_PERSONAL_COPY.badwordColour.replace('{term}', badword.term)}
                value={badword.colour ?? ''}
                onChange={(colour) => change(badword.term, { colour })}
              />
              <Toggle
                bare
                label={MODVIEW_PERSONAL_COPY.badwordSuggest}
                checked={badword.isSuggested}
                onChange={(isSuggested) => change(badword.term, { isSuggested })}
              />
            </TermBox>
          ))}
        </ul>
      )}
    </div>
  )
}
