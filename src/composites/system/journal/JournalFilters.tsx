'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/Input'
import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { JournalExport } from '@/composites/system/journal/JournalExport'
import {
  JOURNAL_COPY,
  JOURNAL_DEFAULT_PERIOD,
  JOURNAL_LIMITS,
  JOURNAL_PARAMS,
  JOURNAL_PERIODS,
} from '@/declarations/system/journal'
import { JOURNAL_TABLE_STYLES } from '@/declarations/ui/variants'
import { EVENT_ORIGINS, EVENT_TYPES, LOG_LEVELS } from '@/utils/constants/events'

export interface JournalFiltersProps {
  actors: { id: string; name: string }[]
}

// Options of an enumeration without its retired entries
const optionsOf = (list: { name: string; label: string; deprecated?: boolean }[]) =>
  list
    .filter((entry) => !entry.deprecated)
    .map((entry) => ({ value: entry.name, label: entry.label }))

/**
 * Filter bar of the journal, state lives in the address
 * @param {{ id: string, name: string }[]} actors - Members who acted lately
 * @return {JSX.Element}
 */

export const JournalFilters = ({ actors }: JournalFiltersProps) => {
  const router = useRouter()
  const params = useSearchParams()
  const [search, setSearch] = useState(params.get(JOURNAL_PARAMS.search) ?? '')

  // Change one filter, back to page one
  const apply = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())

    if (value) next.set(key, value)
    else next.delete(key)
    next.delete(JOURNAL_PARAMS.page)

    router.replace(`?${next.toString()}`, { scroll: false })
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    apply(JOURNAL_PARAMS.search, search.trim())
  }

  const reset = () => {
    setSearch('')
    router.replace('?', { scroll: false })
  }

  const select = (
    key: string,
    label: string,
    emptyLabel: string,
    options: { value: string; label: string }[]
  ) => (
    <div className={JOURNAL_TABLE_STYLES.select}>
      <SelectMenu
        label={label}
        emptyLabel={emptyLabel}
        options={options}
        value={params.get(key) ?? ''}
        onChange={(value) => apply(key, value)}
      />
    </div>
  )

  return (
    <div className={JOURNAL_TABLE_STYLES.filters}>
      <form className={JOURNAL_TABLE_STYLES.search} onSubmit={submit}>
        <Input
          type="search"
          value={search}
          maxLength={JOURNAL_LIMITS.searchLength}
          placeholder={JOURNAL_COPY.searchPlaceholder}
          aria-label={JOURNAL_COPY.searchLabel}
          onChange={(event) => setSearch(event.target.value)}
        />
      </form>
      {select(
        JOURNAL_PARAMS.level,
        JOURNAL_COPY.levelLabel,
        JOURNAL_COPY.allLevels,
        optionsOf(LOG_LEVELS.list)
      )}
      {select(
        JOURNAL_PARAMS.event,
        JOURNAL_COPY.eventLabel,
        JOURNAL_COPY.allEvents,
        optionsOf(EVENT_TYPES.list)
      )}
      {select(
        JOURNAL_PARAMS.origin,
        JOURNAL_COPY.originLabel,
        JOURNAL_COPY.allOrigins,
        optionsOf(EVENT_ORIGINS.list)
      )}
      {select(
        JOURNAL_PARAMS.actor,
        JOURNAL_COPY.actorLabel,
        JOURNAL_COPY.allActors,
        actors.map((actor) => ({ value: actor.id, label: actor.name }))
      )}
      <div className={JOURNAL_TABLE_STYLES.select}>
        <SelectMenu
          label={JOURNAL_COPY.periodLabel}
          options={Object.entries(JOURNAL_PERIODS).map(([value, period]) => ({
            value,
            label: period.label,
          }))}
          value={params.get(JOURNAL_PARAMS.period) ?? JOURNAL_DEFAULT_PERIOD}
          onChange={(value) => apply(JOURNAL_PARAMS.period, value)}
        />
      </div>
      <Button onClick={reset}>{JOURNAL_COPY.reset}</Button>
      <JournalExport />
    </div>
  )
}
