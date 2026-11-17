'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { usePlayAdminLogs } from '@/core/hooks/data/play/usePlayAdminLogs'
import { fillPlayMessage } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY as COPY } from '@/declarations/play/admin'
import { PLAY_LOG_EVENTS } from '@/declarations/play/journal'
import { JOURNAL_PERIODS } from '@/declarations/system/monitoring/journal'
import { PLAY_LOGS } from '@/declarations/ui/variants'
import type { PlayAdminLog, PlayAdminLogStats, PlayAdminRow } from '@/types/play'
import { cn } from '@/utils/classnames'
import { EVENT_TYPES } from '@/utils/constants/events'
import { formatDayTime } from '@/utils/format/time/dates'

// Rows drawn grey while a page loads
const SKELETON_ROWS = 8

// Period offered by the filter
const PERIODS = Object.entries(JOURNAL_PERIODS).map(([value, period]) => ({
  value,
  label: period.label,
}))

// Kinds of line offered by the filter
const TYPES = PLAY_LOG_EVENTS.map((name) => ({
  value: name,
  label: EVENT_TYPES.byName(name).label,
}))

export interface PlayAdminLogsProps {
  stats: PlayAdminLogStats
  // Players of the filter
  players: PlayAdminRow[]
}

// One labelled fact of an opened line
const Fact = ({ label, value }: { label: string; value: string | null }) => (
  <div>
    <dt className={PLAY_LOGS.factLabel}>{label}</dt>
    <dd className={PLAY_LOGS.factValue}>{value ?? COPY.railNone}</dd>
  </div>
)

// One journal line, opened for its facts
const Row = ({ log }: { log: PlayAdminLog }) => (
  <li>
    <details>
      <summary className={PLAY_LOGS.summary}>
        <span className={PLAY_LOGS.moment}>{formatDayTime(log.createdAt)}</span>
        <span className={cn(PLAY_LOGS.kind, log.isAdminAction && PLAY_LOGS.kindAdmin)}>
          {log.eventLabel ?? COPY.logsSystem}
        </span>
        <span className={PLAY_LOGS.cell}>{log.subjectName ?? COPY.railNone}</span>
        <span className={PLAY_LOGS.muted}>{log.actorName ?? COPY.logsSystem}</span>
        <span className={PLAY_LOGS.cell}>{log.summary}</span>
      </summary>
      <dl className={PLAY_LOGS.detail}>
        <Fact label={COPY.logsDetailMoment} value={formatDayTime(log.createdAt)} />
        <Fact label={COPY.logsDetailAuthor} value={log.actorName} />
        <Fact label={COPY.logsDetailPlayer} value={log.subjectName} />
        <Fact label={COPY.logsDetailId} value={log.subjectId} />
      </dl>
    </details>
  </li>
)

/**
 * Play journal laid out like the Memora logs: figures, filter bar, table of lines opened for their facts, pager, each page fetched
 * @param {PlayAdminLogsProps} props - Figures and players
 * @return {JSX.Element}
 */

export const PlayAdminLogs = ({ stats, players }: PlayAdminLogsProps) => {
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = usePlayAdminLogs(filters)

  // Change one filter, back to page one
  const apply = (key: string, value: string) =>
    setFilters((current) =>
      Object.fromEntries([
        ...Object.entries(current).filter(([name]) => name !== key && name !== 'page'),
        ...(value ? [[key, value]] : []),
      ])
    )

  const submit = (event: FormEvent) => {
    event.preventDefault()
    apply('q', search.trim())
  }

  const reset = () => {
    setSearch('')
    setFilters({})
  }

  const figures = [
    [COPY.logsLast24h, stats.last24h],
    [COPY.logsWeek, stats.week],
    [COPY.logsAdminWeek, stats.adminWeek],
  ] as const

  const page = data?.page ?? 1
  const go = (next: number) => setFilters((current) => ({ ...current, page: String(next) }))

  return (
    <div className={PLAY_LOGS.page}>
      <div className={PLAY_LOGS.figures}>
        {figures.map(([label, value]) => (
          <div key={label} className={PLAY_LOGS.figure}>
            <span className={PLAY_LOGS.figureValue}>{value.toLocaleString('fr-FR')}</span>
            <span className={PLAY_LOGS.figureLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={PLAY_LOGS.filters}>
        <form onSubmit={submit} className={PLAY_LOGS.search}>
          <input
            type="search"
            value={search}
            placeholder={COPY.logsSearch}
            aria-label={COPY.logsSearch}
            onChange={(event) => setSearch(event.target.value)}
            className={PLAY_LOGS.field}
          />
        </form>
        <div className={PLAY_LOGS.select}>
          <SelectMenu
            isPlay
            label={COPY.logsPeriod}
            options={PERIODS}
            value={filters.period ?? 'week'}
            onChange={(value) => apply('period', value)}
          />
        </div>
        <div className={PLAY_LOGS.select}>
          <SelectMenu
            isPlay
            label={COPY.logsType}
            emptyLabel={COPY.logsAllTypes}
            options={TYPES}
            value={filters.type ?? ''}
            onChange={(value) => apply('type', value)}
          />
        </div>
        <div className={PLAY_LOGS.select}>
          <SelectMenu
            isPlay
            label={COPY.logsPlayer}
            emptyLabel={COPY.logsAllPlayers}
            options={players.map((entry) => ({ value: entry.accountId, label: entry.name }))}
            value={filters.player ?? ''}
            onChange={(value) => apply('player', value)}
          />
        </div>
        <Button variant="arcade" onClick={reset}>
          {COPY.logsReset}
        </Button>
      </div>

      <div className={PLAY_LOGS.panel}>
        {isLoading ? (
          <div className={PLAY_LOGS.list} aria-busy="true">
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <span key={index} className={PLAY_LOGS.skeleton} />
            ))}
          </div>
        ) : isError ? (
          <p className={PLAY_LOGS.empty}>{COPY.logsError}</p>
        ) : !data || data.entries.length === 0 ? (
          <p className={PLAY_LOGS.empty}>
            {Object.keys(filters).length > 0 ? COPY.logsNoResultTitle : COPY.logsEmpty}
          </p>
        ) : (
          <>
            <div className={PLAY_LOGS.head}>
              {COPY.logsColumns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            <ol className={PLAY_LOGS.list}>
              {data.entries.map((log) => (
                <Row key={log.id} log={log} />
              ))}
            </ol>
          </>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className={PLAY_LOGS.pager}>
          <Button variant="arcade" disabled={page <= 1} onClick={() => go(page - 1)}>
            {COPY.logsPrev}
          </Button>
          <span className={PLAY_LOGS.pagerNote}>
            {fillPlayMessage(COPY.logsPage, { page, pages: data.pages })}
          </span>
          <Button variant="arcade" disabled={page >= data.pages} onClick={() => go(page + 1)}>
            {COPY.logsNext}
          </Button>
        </div>
      )}
    </div>
  )
}
