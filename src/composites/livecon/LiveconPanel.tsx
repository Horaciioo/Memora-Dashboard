'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDialog } from '@/components/structures/FormDialog'
import { Markdown } from '@/components/elements/display/Markdown'
import { Section } from '@/components/structures/Section'
import { useLivecon } from '@/core/hooks/data/useLivecon'
import { LIVECON_COPY } from '@/declarations/livecon/copy'
import { ROUTES } from '@/declarations/navigation'
import { LIST_STYLES, TIMELINE_STYLES } from '@/declarations/ui/variants'
import { toTone, TONES } from '@/declarations/ui/theme'
import type { FieldDefinition } from '@/types/forms'
import type { LiveconHistoryEntry, LiveconLevelView, LiveconStateView } from '@/types/livecon'
import { formatDayTime } from '@/utils/format/dates'
import { cn } from '@/utils/classnames'

export interface LiveconPanelProps {
  levels: LiveconLevelView[]
  initialState: LiveconStateView[]
  history: LiveconHistoryEntry[]
  fields: FieldDefinition[]
  canUpdate: boolean
}

/**
 * Livecon board — what is in force, the declared levels with their guidelines, and the
 * log of every switch
 * @param {LiveconLevelView[]} levels - Declared levels
 * @param {LiveconStateView[]} initialState - Levels in force, resolved server-side
 * @param {LiveconHistoryEntry[]} history - Past switches
 * @param {FieldDefinition[]} fields - Declarations of the switch form
 * @param {boolean} canUpdate - Member may switch a level
 * @return {JSX.Element}
 */

export const LiveconPanel = ({
  levels,
  initialState,
  history,
  fields,
  canUpdate,
}: LiveconPanelProps) => {
  const livecon = useLivecon(initialState)
  const [isSwitching, setSwitching] = useState(false)

  const openSwitch = () => {
    livecon.clearIssues()
    setSwitching(true)
  }

  if (levels.length === 0) {
    return (
      <EmptyState
        figure="livecon"
        title={LIVECON_COPY.emptyTitle}
        description={LIVECON_COPY.emptyDescription}
        action={
          <Link href={ROUTES.settingsSection('livecon')}>
            <Button variant="primary" icon="settings">
              {LIVECON_COPY.configure}
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <>
      <Section
        title={LIVECON_COPY.currentTitle}
        action={
          canUpdate ? (
            <Button variant="primary" icon="livecon" onClick={openSwitch}>
              {LIVECON_COPY.change}
            </Button>
          ) : undefined
        }
        bare
      >
        {livecon.state.length === 0 ? (
          <EmptyState
            figure="livecon"
            title={LIVECON_COPY.emptyStateTitle}
            description={LIVECON_COPY.emptyStateDescription}
            action={
              <Button variant="primary" icon="livecon" disabled={!canUpdate} onClick={openSwitch}>
                {LIVECON_COPY.change}
              </Button>
            }
          />
        ) : (
          <div className={LIST_STYLES.grid}>
            {livecon.state.map((entry) => {
              const tone = toTone(entry.level.accent, 'brand')

              return (
                <article
                  key={entry.id}
                  className={cn(
                    'flex flex-col gap-2 rounded-[var(--radius-lg)] border-2 p-4',
                    TONES[tone].border,
                    TONES[tone].soft
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn('text-3xl font-extrabold tabular-nums', TONES[tone].text)}>
                      {entry.level.level}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-bold">{entry.level.name}</span>
                      <span className="truncate text-xs text-[var(--color-ink-subtle)]">
                        {entry.youtuber?.label ?? LIVECON_COPY.global}
                      </span>
                    </span>
                  </span>
                  {entry.reason && <p className="text-sm">{entry.reason}</p>}
                  <span className="text-xs text-[var(--color-ink-subtle)]">
                    {`${LIVECON_COPY.since} ${formatDayTime(entry.startedAt)}`}
                    {entry.actorName && ` · ${LIVECON_COPY.by} ${entry.actorName}`}
                  </span>
                </article>
              )
            })}
          </div>
        )}
      </Section>

      <Section title={LIVECON_COPY.levelsTitle} bare>
        <div className="flex flex-col gap-3">
          {levels.map((level) => {
            const tone = toTone(level.accent, 'neutral')

            return (
              <article
                key={level.id}
                className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
              >
                <header className="flex flex-wrap items-center gap-2">
                  <Badge label={`${LIVECON_COPY.title} ${level.level}`} tone={tone} dot />
                  <h3 className="font-bold">{level.name}</h3>
                </header>
                {level.summary && (
                  <p className="text-sm text-[var(--color-ink-subtle)]">{level.summary}</p>
                )}
                {level.guidelines ? (
                  <Markdown source={level.guidelines} />
                ) : (
                  <p className="text-sm text-[var(--color-ink-subtle)] italic">
                    {LIVECON_COPY.noGuidelines}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      </Section>

      <Section
        title={LIVECON_COPY.historyTitle}
        bare={history.length === 0}
        padded={history.length > 0}
      >
        {history.length === 0 ? (
          <EmptyState
            figure="notes"
            title={LIVECON_COPY.historyEmptyTitle}
            description={LIVECON_COPY.historyEmptyDescription}
            action={<Badge label={LIVECON_COPY.historyEmptyTitle} tone="neutral" />}
          />
        ) : (
          <ol className={TIMELINE_STYLES.list}>
            {history.map((entry, index) => {
              const tone = toTone(entry.accent, 'neutral')

              return (
                <li key={entry.id} className={TIMELINE_STYLES.item}>
                  {index < history.length - 1 && (
                    <span className={TIMELINE_STYLES.rail} aria-hidden="true" />
                  )}
                  <span className={cn(TIMELINE_STYLES.dot, TONES[tone].dot)} aria-hidden="true" />
                  <div className={TIMELINE_STYLES.body}>
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge label={`${entry.level} · ${entry.levelName}`} tone={tone} />
                      <span>{entry.scopeLabel}</span>
                    </span>
                    <span className={TIMELINE_STYLES.meta}>
                      {[formatDayTime(entry.startedAt), entry.actorName, entry.reason]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </Section>

      <FormDialog
        open={isSwitching}
        title={LIVECON_COPY.changeTitle}
        fields={fields}
        issues={livecon.issues}
        isSaving={livecon.isSaving}
        onSubmit={livecon.apply}
        onClose={() => setSwitching(false)}
      />
    </>
  )
}
