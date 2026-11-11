'use client'

import { TermBox } from '@/composites/modview/TermBox'
import { WordForm } from '@/composites/modview/WordForm'
import { useSharedWords } from '@/core/hooks/data/lives/useSharedWords'
import { MODVIEW_PERSONAL, MODVIEW_PERSONAL_COPY } from '@/declarations/modview/personal'
import { MODVIEW_TERMS, OFFENSE_SHEET } from '@/declarations/ui/variants'

/**
 * Watch words the whole team sees on the live, orange in the chat
 * @return {JSX.Element | null}
 */

export const SharedWordsEditor = () => {
  const { words, canEdit, add, remove } = useSharedWords()
  if (!canEdit && words.length === 0) return null

  return (
    <div className={OFFENSE_SHEET.block}>
      <span className={OFFENSE_SHEET.label}>{MODVIEW_PERSONAL_COPY.sharedHead}</span>
      <p className={MODVIEW_TERMS.hint}>{MODVIEW_PERSONAL_COPY.sharedHint}</p>
      {canEdit && (
        <WordForm
          placeholder={MODVIEW_PERSONAL_COPY.sharedPlaceholder}
          isFull={words.length >= MODVIEW_PERSONAL.maxSharedWords}
          onAdd={(term) => void add(term)}
        />
      )}
      {words.length === 0 ? (
        <p className={OFFENSE_SHEET.placeholder}>{MODVIEW_PERSONAL_COPY.sharedEmpty}</p>
      ) : (
        <ul className={MODVIEW_TERMS.list}>
          {words.map((word) => (
            <TermBox
              key={word.id}
              term={word.term}
              title={
                word.authorName
                  ? MODVIEW_PERSONAL_COPY.sharedBy.replace('{name}', word.authorName)
                  : undefined
              }
              onRemove={canEdit ? () => void remove(word.id) : undefined}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
