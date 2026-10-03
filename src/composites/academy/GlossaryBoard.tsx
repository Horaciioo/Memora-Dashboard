'use client'

import { useMemo, useState } from 'react'

import { Input } from '@/components/elements/forms/Input'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { GLOSSARY_REGISTRY } from '@/declarations/academy/glossary'
import { GLOSSARY_STYLES } from '@/declarations/ui/variants'
import { foldText } from '@/utils/format/strings'

/**
 * Lexicon of the academy: a search, then one quiet line per term, the word on the left and
 * what it means on the right
 * @return {JSX.Element}
 */

export const GlossaryBoard = () => {
  const [search, setSearch] = useState('')
  const needle = foldText(search.trim())

  // Alphabetical, narrowed to the terms under the search
  const entries = useMemo(
    () =>
      [...GLOSSARY_REGISTRY.list]
        .sort((left, right) => left.label.localeCompare(right.label, 'fr'))
        .filter(
          (entry) => !needle || foldText(`${entry.label} ${entry.definition}`).includes(needle)
        ),
    [needle]
  )

  return (
    <div className={GLOSSARY_STYLES.page}>
      <Input
        type="search"
        value={search}
        placeholder={ACADEMY_COPY.glossarySearch}
        aria-label={ACADEMY_COPY.glossarySearch}
        className={GLOSSARY_STYLES.search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {entries.length === 0 ? (
        <p className={GLOSSARY_STYLES.empty}>{ACADEMY_COPY.glossaryEmpty}</p>
      ) : (
        <dl className={GLOSSARY_STYLES.list}>
          {entries.map((entry) => (
            <div key={entry.label} className={GLOSSARY_STYLES.row}>
              <dt className={GLOSSARY_STYLES.term}>{entry.label}</dt>
              <dd className={GLOSSARY_STYLES.definition}>{entry.definition}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
