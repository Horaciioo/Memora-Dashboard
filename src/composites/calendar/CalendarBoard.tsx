'use client'

import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { Dialog } from '@/components/structures/Dialog'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { useCalendar } from '@/core/hooks/data/useCalendar'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { CALENDAR_COPY, CALENDAR_FIELD_COPY, WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import { CALENDAR_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { TONES, toTone } from '@/declarations/ui/theme'
import { CALENDAR_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import type { FieldDefinition } from '@/types/forms'
import { cn } from '@/utils/classnames'
import {
  gridRange,
  hourOf,
  monthGrid,
  moveToDay,
  moveToSlot,
  periodLabel,
  shiftAnchor,
  timeOf,
  toDayKey,
  weekGrid,
} from '@/utils/format/calendar'
import { formatDayTime } from '@/utils/format/dates'

export interface CalendarBoardProps {
  initialEntries: CalendarEntry[]
  fields: FieldDefinition[]
  anchor: string
  hasTypes: boolean
  canManage: boolean
  sessionId?: string
}

// A week slot identifier pairs its day with its hour
const SLOT_SEPARATOR = '|'

// Reference collection holding the declared event types
const EVENT_TYPE_SECTION = 'evenements'

// Day add glyph
const DayAddIcon = ICONS.add

/**
 * Shared calendar, month and week views, every card draggable onto another moment
 * @param {CalendarEntry[]} initialEntries - Entries resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the entry form
 * @param {string} anchor - ISO day the grid opens on
 * @param {boolean} hasTypes - At least one event type is declared
 * @param {boolean} canManage - Member may post and move entries
 * @param {string} [sessionId] - Bounds the board to one academy session
 * @return {JSX.Element}
 */

export const CalendarBoard = ({
  initialEntries,
  fields,
  anchor,
  hasTypes,
  canManage,
  sessionId,
}: CalendarBoardProps) => {
  const calendar = useCalendar(initialEntries, sessionId)
  const [unit, setUnit] = useState<'month' | 'week'>('month')
  const [cursor, setCursor] = useState(anchor)
  const [dialog, setDialog] = useState<'form' | 'detail' | null>(null)
  const [editing, setEditing] = useState<CalendarEntry | null>(null)
  const [draftStartsAt, setDraftStartsAt] = useState<string | null>(null)
  const [opened, setOpened] = useState<CalendarEntry | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<CalendarEntry | null>(null)

  const days = useMemo(
    () => (unit === 'month' ? monthGrid(cursor) : weekGrid(cursor)),
    [cursor, unit]
  )

  const range = useMemo(() => gridRange(days), [days])

  // The server only ever sends the window on screen, so browsing pulls the next one
  useEffect(() => {
    void calendar.load(range.from, range.to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to])

  // Entries land in the bucket of the day they start on
  const byDay = useMemo(() => {
    const buckets = new Map<string, CalendarEntry[]>()

    for (const entry of calendar.entries) {
      const key = toDayKey(entry.startsAt)
      buckets.set(key, [...(buckets.get(key) ?? []), entry])
    }

    return buckets
  }, [calendar.entries])

  const { over, itemProps, containerProps } = useDragAndDrop((item, container) => {
    const entry = calendar.entries.find((row) => row.id === item.id)
    if (!entry) return

    const [dayKey, hour] = container.split(SLOT_SEPARATOR)

    void calendar.move(
      entry.id,
      hour === undefined ? moveToDay(entry.startsAt, dayKey) : moveToSlot(dayKey, Number(hour))
    )
  })

  const openForm = (entry: CalendarEntry | null, dayKey?: string) => {
    calendar.clearIssues()
    setEditing(entry)
    // Prefill the day clicked, edits keep their own moment
    setDraftStartsAt(
      entry || !dayKey
        ? null
        : moveToSlot(dayKey, CALENDAR_SETTINGS.dayStartHour).toISOString().slice(0, 16)
    )
    setDialog('form')
  }

  const hours = useMemo(() => {
    const { dayStartHour, dayEndHour } = CALENDAR_SETTINGS

    return Array.from({ length: dayEndHour - dayStartHour + 1 }, (_, index) => dayStartHour + index)
  }, [])

  /**
   * Draw one entry card
   * @param {CalendarEntry} entry - Entry to draw
   * @param {string} container - Drop container it sits in
   * @return {JSX.Element}
   */

  const renderEntry = (entry: CalendarEntry, container: string) => {
    const tone = TONES[toTone(entry.accent, 'brand')]

    return (
      <button
        key={entry.id}
        type="button"
        onClick={() => {
          setOpened(entry)
          setDialog('detail')
        }}
        className={cn(CALENDAR_STYLES.entry, tone.soft, tone.text)}
        {...(canManage && !entry.readOnly ? itemProps({ id: entry.id, from: container }) : {})}
      >
        {!entry.allDay && (
          <span className={CALENDAR_STYLES.entryTime}>{timeOf(entry.startsAt)}</span>
        )}
        <span className={CALENDAR_STYLES.entryTitle}>{entry.title}</span>
      </button>
    )
  }

  if (!hasTypes) {
    return (
      <EmptyState
        figure="settings"
        title={CALENDAR_COPY.noTypesTitle}
        description={CALENDAR_COPY.noTypesDescription}
        action={
          <Link href={ROUTES.settingsSection(EVENT_TYPE_SECTION)}>
            <Button variant="primary" icon="settings">
              {CALENDAR_COPY.configure}
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <>
      <Section description={CALENDAR_COPY.moveHint} bare>
        <div className={CALENDAR_STYLES.toolbar}>
          <Button
            variant="icon"
            icon="back"
            aria-label={CALENDAR_COPY.previous}
            onClick={() => setCursor(shiftAnchor(cursor, unit, -1))}
          />
          <Button
            variant="icon"
            icon="forward"
            aria-label={CALENDAR_COPY.next}
            onClick={() => setCursor(shiftAnchor(cursor, unit, 1))}
          />
          <span className="text-base font-bold first-letter:uppercase">
            {periodLabel(cursor, unit)}
          </span>
          <Button className="ml-auto" onClick={() => setCursor(toDayKey(new Date()))}>
            {CALENDAR_COPY.today}
          </Button>
          <SegmentedControl
            options={[
              { value: 'month', label: CALENDAR_COPY.month },
              { value: 'week', label: CALENDAR_COPY.week },
            ]}
            value={unit}
            onChange={setUnit}
            label={CALENDAR_COPY.title}
          />
        </div>

        <div className={CALENDAR_STYLES.frame}>
          <div
            className={cn(
              CALENDAR_STYLES.weekdays,
              unit === 'week' ? CALENDAR_STYLES.weekdaysWeek : CALENDAR_STYLES.weekdaysMonth
            )}
          >
            {unit === 'week' && <span className={CALENDAR_STYLES.weekday} />}
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className={CALENDAR_STYLES.weekday}>
                {label}
              </span>
            ))}
          </div>

          {unit === 'month' ? (
            <div className={CALENDAR_STYLES.month}>
              {days.map((day) => {
                const entries = byDay.get(day.key) ?? []
                const shown = entries.slice(0, CALENDAR_SETTINGS.maxEntriesPerDay)
                const hidden = entries.length - shown.length

                return (
                  <div
                    key={day.key}
                    className={cn(
                      CALENDAR_STYLES.day,
                      !day.isCurrentMonth && CALENDAR_STYLES.dayOutside,
                      day.isToday && CALENDAR_STYLES.dayToday,
                      over === day.key && 'is-drop-target'
                    )}
                    {...(canManage ? containerProps(day.key) : {})}
                  >
                    <span
                      className={cn(
                        CALENDAR_STYLES.dayNumber,
                        !day.isCurrentMonth && CALENDAR_STYLES.dayNumberOutside
                      )}
                    >
                      {day.dayOfMonth}
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        aria-label={CALENDAR_COPY.add}
                        className={CALENDAR_STYLES.dayAdd}
                        onClick={() => openForm(null, day.key)}
                      >
                        <DayAddIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                    {shown.map((entry) => renderEntry(entry, day.key))}
                    {hidden > 0 && (
                      <span className={CALENDAR_STYLES.overflow}>
                        {`+${hidden} ${CALENDAR_COPY.more}`}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={CALENDAR_STYLES.week}>
              {hours.map((hour) => (
                <Fragment key={hour}>
                  <span
                    className={CALENDAR_STYLES.hour}
                  >{`${String(hour).padStart(2, '0')}:00`}</span>
                  {days.map((day) => {
                    const slot = `${day.key}${SLOT_SEPARATOR}${hour}`
                    const entries = (byDay.get(day.key) ?? []).filter(
                      (entry) => hourOf(entry.startsAt) === hour
                    )

                    return (
                      <div
                        key={slot}
                        className={cn(
                          CALENDAR_STYLES.slot,
                          day.isToday && CALENDAR_STYLES.dayToday,
                          over === slot && 'is-drop-target'
                        )}
                        {...(canManage ? containerProps(slot) : {})}
                      >
                        {entries.map((entry) => renderEntry(entry, slot))}
                      </div>
                    )
                  })}
                </Fragment>
              ))}
            </div>
          )}
        </div>

        {calendar.entries.length === 0 && (
          <EmptyState
            figure="settings"
            title={CALENDAR_COPY.emptyTitle}
            action={
              <Button
                variant="primary"
                icon="add"
                disabled={!canManage}
                onClick={() => openForm(null)}
              >
                {CALENDAR_COPY.add}
              </Button>
            }
          />
        )}
      </Section>

      <FormDialog
        open={dialog === 'form'}
        title={editing ? CALENDAR_COPY.edit : CALENDAR_COPY.add}
        icon={editing ? 'edit' : 'add'}
        fields={fields}
        initialValues={editing?.values ?? (draftStartsAt ? { startsAt: draftStartsAt } : undefined)}
        issues={calendar.issues}
        isSaving={calendar.isSaving}
        size="lg"
        onSubmit={(values) =>
          editing ? calendar.update(editing.id, values) : calendar.create(values)
        }
        onClose={() => setDialog(null)}
      />

      <Dialog
        open={dialog === 'detail' && opened !== null}
        title={opened?.title ?? ''}
        description={opened?.typeName ?? undefined}
        tone={toTone(opened?.accent, 'brand')}
        onClose={() => setDialog(null)}
        footer={
          opened && !opened.readOnly ? (
            <>
              <Button
                variant="danger"
                icon="remove"
                disabled={!canManage}
                onClick={() => {
                  setPendingDeletion(opened)
                  setDialog(null)
                }}
              >
                {ACTION_COPY.delete}
              </Button>
              <Button
                variant="primary"
                icon="edit"
                disabled={!canManage}
                onClick={() => openForm(opened)}
              >
                {ACTION_COPY.edit}
              </Button>
            </>
          ) : undefined
        }
      >
        {opened && (
          <div className="flex flex-col gap-4">
            <span className="flex flex-wrap items-center gap-2">
              {opened.typeName && (
                <Badge label={opened.typeName} tone={toTone(opened.accent, 'brand')} />
              )}
              <Badge
                label={EVENT_VISIBILITY_REGISTRY.label(opened.visibility)}
                tone={toTone(EVENT_VISIBILITY_REGISTRY.get(opened.visibility).accent, 'neutral')}
                icon="visible"
              />
            </span>
            <DetailGrid
              entries={[
                { label: CALENDAR_FIELD_COPY.startsAt, value: formatDayTime(opened.startsAt) },
                {
                  label: CALENDAR_FIELD_COPY.endsAt,
                  value: opened.endsAt ? formatDayTime(opened.endsAt) : undefined,
                },
                { label: CALENDAR_FIELD_COPY.description, value: opened.description },
              ]}
            />
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={CALENDAR_COPY.deleteTitle}
        description={CALENDAR_COPY.deleteDescription}
        pending={calendar.isSaving}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={async () => {
          await calendar.remove(pendingDeletion!.id)
          setPendingDeletion(null)
        }}
      />
    </>
  )
}
