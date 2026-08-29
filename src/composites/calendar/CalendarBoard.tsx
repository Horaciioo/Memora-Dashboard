'use client'

import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { Dialog } from '@/components/structures/Dialog'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { CalendarEntryChip } from '@/composites/calendar/CalendarEntryChip'
import { CalendarLegend } from '@/composites/calendar/CalendarLegend'
import { useCalendar } from '@/core/hooks/data/useCalendar'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { useSlotDraft } from '@/core/hooks/interaction/useSlotDraft'
import { CALENDAR_COPY, CALENDAR_FIELD_COPY, WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import {
  CALENDAR_KIND_REGISTRY,
  CALENDAR_SOURCE_REGISTRY,
} from '@/declarations/calendar/registries'
import { CALENDAR_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { accentPaint, accentVars, toTone } from '@/declarations/ui/theme'
import { CALENDAR_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { CalendarKinds } from '@/utils/constants/workflow'
import type { CalendarSourceName } from '@/utils/constants/workflow'
import {
  coversDay,
  dayBounds,
  gridRange,
  hourOf,
  lastDayKey,
  monthGrid,
  moveToDay,
  moveToSlot,
  periodLabel,
  shiftAnchor,
  slotEnd,
  toDayKey,
  toFieldValue,
  weekGrid,
} from '@/utils/format/calendar'
import { formatDayTime } from '@/utils/format/dates'

export interface CalendarBoardProps {
  initialEntries: CalendarEntry[]
  fields: FieldDefinition[]
  anchor: string
  canManage: boolean
  // At least one template is declared, so the board points at the configuration
  hasTemplates?: boolean
  sessionId?: string
}

// A week slot identifier pairs its day with its padded hour
const SLOT_SEPARATOR = '|'

// Reference collection holding the declared templates
const TEMPLATE_SECTION = 'evenements'

// Fields a whole selection can be rewritten with at once
const BULK_FIELD_NAMES = ['kind', 'templateId', 'accent', 'accountId', 'visibility', 'youtuberId']

// Day add glyph
const DayAddIcon = ICONS.add

/**
 * Shared calendar — zones as a background, periods as bands, events as cards, every one of
 * them draggable, selectable and creatable straight from the grid
 * @param {CalendarEntry[]} initialEntries - Entries resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the entry form
 * @param {string} anchor - ISO day the grid opens on
 * @param {boolean} canManage - Member may post and move entries
 * @param {boolean} [hasTemplates] - At least one template is declared
 * @param {string} [sessionId] - Bounds the board to one academy session
 * @return {JSX.Element}
 */

export const CalendarBoard = ({
  initialEntries,
  fields,
  anchor,
  canManage,
  hasTemplates,
  sessionId,
}: CalendarBoardProps) => {
  const calendar = useCalendar(initialEntries, sessionId)
  const [unit, setUnit] = useState<'month' | 'week'>('month')
  const [cursor, setCursor] = useState(anchor)
  const [dialog, setDialog] = useState<'form' | 'detail' | 'bulk' | null>(null)
  const [editing, setEditing] = useState<CalendarEntry | null>(null)
  const [draft, setDraft] = useState<FormValues | null>(null)
  const [opened, setOpened] = useState<CalendarEntry | null>(null)
  const [selection, setSelection] = useState<string[]>([])
  const [hidden, setHidden] = useState<CalendarSourceName[]>([])
  const [pendingDeletion, setPendingDeletion] = useState<CalendarEntry[] | null>(null)

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

  const visible = useMemo(
    () => calendar.entries.filter((entry) => !hidden.includes(entry.source)),
    [calendar.entries, hidden]
  )

  // Every entry lands in each of the days it runs across, so a band draws on all of them
  const byDay = useMemo(() => {
    const buckets = new Map<string, CalendarEntry[]>()

    for (const day of days) {
      buckets.set(
        day.key,
        visible.filter((entry) => coversDay(entry.startsAt, entry.endsAt, day.key))
      )
    }

    return buckets
  }, [days, visible])

  const entriesOf = (dayKey: string, kind: string) =>
    (byDay.get(dayKey) ?? []).filter(
      (entry) =>
        entry.kind === kind &&
        // A card belongs to the day it opens on, only bands and zones run across days
        (kind !== CalendarKinds.Event || toDayKey(entry.startsAt) === dayKey)
    )

  const { over, itemProps, containerProps } = useDragAndDrop((item, container) => {
    const entry = calendar.entries.find((row) => row.id === item.id)
    if (!entry || entry.readOnly) return

    const [dayKey, hour] = container.split(SLOT_SEPARATOR)

    void calendar.move(
      entry.id,
      hour === undefined ? moveToDay(entry.startsAt, dayKey) : moveToSlot(dayKey, Number(hour))
    )
  })

  const openForm = (entry: CalendarEntry | null, prefill?: FormValues) => {
    calendar.clearIssues()
    setEditing(entry)
    setDraft(entry ? null : (prefill ?? null))
    setDialog('form')
  }

  const {
    draft: slotDraft,
    covers,
    slotProps,
  } = useSlotDraft((from, to) => {
    const [fromDay, fromHour] = from.split(SLOT_SEPARATOR)
    const [toDay, toHour] = to.split(SLOT_SEPARATOR)

    // A slide across hours makes an event, a slide across days makes a period
    const bounds =
      fromHour === undefined
        ? {
            startsAt: dayBounds(
              fromDay,
              CALENDAR_SETTINGS.dayStartHour,
              CALENDAR_SETTINGS.dayEndHour
            ).startsAt,
            endsAt: dayBounds(toDay, CALENDAR_SETTINGS.dayStartHour, CALENDAR_SETTINGS.dayEndHour)
              .endsAt,
            kind: fromDay === toDay ? CalendarKinds.Event : CalendarKinds.Period,
          }
        : {
            startsAt: moveToSlot(fromDay, Number(fromHour)),
            endsAt: slotEnd(fromDay, Number(toHour)),
            kind: CalendarKinds.Event,
          }

    openForm(null, {
      kind: bounds.kind,
      allDay: fromHour === undefined,
      startsAt: toFieldValue(bounds.startsAt),
      endsAt: toFieldValue(bounds.endsAt),
    })
  }, canManage)

  const openEntry = (entry: CalendarEntry, additive: boolean) => {
    // A modifier key gathers a selection, and a projection never joins one
    if (additive && !entry.readOnly && canManage) {
      setSelection((current) =>
        current.includes(entry.id)
          ? current.filter((id) => id !== entry.id)
          : [...current, entry.id]
      )
      return
    }

    setOpened(entry)
    setDialog('detail')
  }

  const hours = useMemo(() => {
    const { dayStartHour, dayEndHour } = CALENDAR_SETTINGS

    return Array.from({ length: dayEndHour - dayStartHour + 1 }, (_, index) => dayStartHour + index)
  }, [])

  const selected = useMemo(
    () => calendar.entries.filter((entry) => selection.includes(entry.id)),
    [calendar.entries, selection]
  )

  const bulkFields = useMemo(
    () => fields.filter((field) => BULK_FIELD_NAMES.includes(field.name)),
    [fields]
  )

  /**
   * Draw the zones running under one day
   * @param {string} dayKey - ISO day
   * @return {JSX.Element | null}
   */

  const renderZones = (dayKey: string) => {
    const zones = entriesOf(dayKey, CalendarKinds.Zone)
    if (zones.length === 0) return null

    return (
      <span className={CALENDAR_STYLES.zoneLayer} aria-hidden="true">
        {zones.map((zone) => {
          const paint = accentPaint(zone.accent, 'neutral')

          return (
            <span
              key={zone.id}
              className={cn(CALENDAR_STYLES.zoneBand, paint.soft)}
              style={paint.style}
            />
          )
        })}
      </span>
    )
  }

  /**
   * Draw the label of every zone opening on one day
   * @param {string} dayKey - ISO day
   * @return {JSX.Element[]}
   */

  const renderZoneLabels = (dayKey: string) =>
    entriesOf(dayKey, CalendarKinds.Zone)
      .filter((zone) => toDayKey(zone.startsAt) === dayKey)
      .map((zone) => (
        <button
          key={zone.id}
          type="button"
          onClick={(event) => openEntry(zone, event.shiftKey || event.metaKey || event.ctrlKey)}
          style={accentVars(zone.accent, 'neutral')}
          className={cn(CALENDAR_STYLES.zoneLabel, accentPaint(zone.accent, 'neutral').text)}
        >
          {zone.title}
        </button>
      ))

  /**
   * Draw the bands running across one day
   * @param {string} dayKey - ISO day
   * @return {JSX.Element[]}
   */

  const renderBands = (dayKey: string) =>
    entriesOf(dayKey, CalendarKinds.Period).map((entry) => (
      <CalendarEntryChip
        key={entry.id}
        entry={entry}
        band
        opensBand={toDayKey(entry.startsAt) === dayKey}
        closesBand={lastDayKey(entry.startsAt, entry.endsAt) === dayKey}
        selected={selection.includes(entry.id)}
        draggable={canManage && !entry.readOnly}
        onOpen={openEntry}
        dragProps={itemProps({ id: entry.id, from: dayKey })}
      />
    ))

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
          <span className={CALENDAR_STYLES.period}>{periodLabel(cursor, unit)}</span>
          <Button className="ml-auto" onClick={() => setCursor(toDayKey(new Date()))}>
            {CALENDAR_COPY.today}
          </Button>
          {canManage && (
            <Button variant="primary" icon="add" onClick={() => openForm(null)}>
              {CALENDAR_COPY.add}
            </Button>
          )}
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

        {selected.length > 0 && (
          <div className={CALENDAR_STYLES.selectionBar}>
            <span className={CALENDAR_STYLES.selectionCount}>{selected.length}</span>
            <span>
              {selected.length > 1 ? CALENDAR_COPY.selectedPlural : CALENDAR_COPY.selected}
            </span>
            <Button className="ml-auto" onClick={() => setSelection([])}>
              {CALENDAR_COPY.clearSelection}
            </Button>
            <Button
              icon="edit"
              onClick={() => {
                calendar.clearIssues()
                setDialog('bulk')
              }}
            >
              {CALENDAR_COPY.editSelection}
            </Button>
            <Button variant="danger" icon="remove" onClick={() => setPendingDeletion(selected)}>
              {CALENDAR_COPY.deleteSelection}
            </Button>
          </div>
        )}

        <div className={CALENDAR_STYLES.frame}>
          <div
            className={cn(
              CALENDAR_STYLES.weekdays,
              unit === 'week' ? CALENDAR_STYLES.weekdaysWeek : CALENDAR_STYLES.weekdaysMonth
            )}
          >
            {unit === 'week' ? (
              <>
                <span className={CALENDAR_STYLES.weekday} />
                {days.map((day, index) => (
                  <span
                    key={day.key}
                    className={cn(CALENDAR_STYLES.weekday, CALENDAR_STYLES.weekdayHead)}
                  >
                    <span>{WEEKDAY_LABELS[index]}</span>
                    <span
                      className={cn(
                        CALENDAR_STYLES.dayNumber,
                        day.isToday && CALENDAR_STYLES.dayNumberToday
                      )}
                    >
                      {day.dayOfMonth}
                    </span>
                  </span>
                ))}
              </>
            ) : (
              WEEKDAY_LABELS.map((label) => (
                <span key={label} className={CALENDAR_STYLES.weekday}>
                  {label}
                </span>
              ))
            )}
          </div>

          {unit === 'month' ? (
            <div className={CALENDAR_STYLES.month}>
              {days.map((day) => {
                const cards = entriesOf(day.key, CalendarKinds.Event)
                const shown = cards.slice(0, CALENDAR_SETTINGS.maxEntriesPerDay)
                const hiddenCount = cards.length - shown.length

                return (
                  <div
                    key={day.key}
                    className={cn(
                      CALENDAR_STYLES.day,
                      !day.isCurrentMonth && CALENDAR_STYLES.dayOutside,
                      covers(day.key) && CALENDAR_STYLES.dayDrafted,
                      over === day.key && 'is-drop-target'
                    )}
                    {...(canManage ? containerProps(day.key) : {})}
                    {...slotProps(day.key)}
                  >
                    {renderZones(day.key)}
                    <span
                      className={cn(
                        CALENDAR_STYLES.dayNumber,
                        !day.isCurrentMonth && CALENDAR_STYLES.dayNumberOutside,
                        day.isToday && CALENDAR_STYLES.dayNumberToday
                      )}
                    >
                      {day.dayOfMonth}
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        aria-label={CALENDAR_COPY.add}
                        className={CALENDAR_STYLES.dayAdd}
                        onClick={() =>
                          openForm(null, {
                            startsAt: toFieldValue(
                              dayBounds(
                                day.key,
                                CALENDAR_SETTINGS.dayStartHour,
                                CALENDAR_SETTINGS.dayEndHour
                              ).startsAt
                            ),
                          })
                        }
                      >
                        <DayAddIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                    {renderZoneLabels(day.key)}
                    {renderBands(day.key)}
                    {shown.map((entry) => (
                      <CalendarEntryChip
                        key={entry.id}
                        entry={entry}
                        selected={selection.includes(entry.id)}
                        draggable={canManage && !entry.readOnly}
                        onOpen={openEntry}
                        dragProps={itemProps({ id: entry.id, from: day.key })}
                      />
                    ))}
                    {hiddenCount > 0 && (
                      <span className={CALENDAR_STYLES.overflow}>
                        {`+${hiddenCount} ${CALENDAR_COPY.more}`}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <>
              <div className={CALENDAR_STYLES.allDay}>
                <span className={CALENDAR_STYLES.allDayLabel}>{CALENDAR_COPY.allDayRow}</span>
                {days.map((day) => (
                  <div key={day.key} className={CALENDAR_STYLES.allDayCell}>
                    {renderZoneLabels(day.key)}
                    {renderBands(day.key)}
                  </div>
                ))}
              </div>

              <div className={CALENDAR_STYLES.week}>
                {hours.map((hour) => (
                  <Fragment key={hour}>
                    <span className={CALENDAR_STYLES.hour}>
                      {`${String(hour).padStart(2, '0')}:00`}
                    </span>
                    {days.map((day) => {
                      const slot = `${day.key}${SLOT_SEPARATOR}${String(hour).padStart(2, '0')}`
                      const cards = entriesOf(day.key, CalendarKinds.Event).filter(
                        (entry) => hourOf(entry.startsAt) === hour
                      )

                      return (
                        <div
                          key={slot}
                          className={cn(
                            CALENDAR_STYLES.slot,
                            covers(slot) &&
                              slotDraft?.from.startsWith(day.key) &&
                              CALENDAR_STYLES.dayDrafted,
                            over === slot && 'is-drop-target'
                          )}
                          {...(canManage ? containerProps(slot) : {})}
                          {...slotProps(slot)}
                        >
                          {renderZones(day.key)}
                          {cards.map((entry) => (
                            <CalendarEntryChip
                              key={entry.id}
                              entry={entry}
                              selected={selection.includes(entry.id)}
                              draggable={canManage && !entry.readOnly}
                              onOpen={openEntry}
                              dragProps={itemProps({ id: entry.id, from: slot })}
                            />
                          ))}
                        </div>
                      )
                    })}
                  </Fragment>
                ))}
              </div>
            </>
          )}
        </div>

        <CalendarLegend
          entries={visible}
          hidden={hidden}
          onToggle={(source) =>
            setHidden((current) =>
              current.includes(source)
                ? current.filter((key) => key !== source)
                : [...current, source]
            )
          }
        />

        {!hasTemplates && canManage && !sessionId && (
          <Link href={ROUTES.settingsSection(TEMPLATE_SECTION)}>
            <Button variant="link" icon="settings">
              {CALENDAR_COPY.noTemplatesTitle}
            </Button>
          </Link>
        )}
      </Section>

      <FormDialog
        open={dialog === 'form'}
        title={editing ? CALENDAR_COPY.edit : CALENDAR_COPY.add}
        fields={fields}
        initialValues={editing?.values ?? draft ?? undefined}
        issues={calendar.issues}
        isSaving={calendar.isSaving}
        size="lg"
        onSubmit={(values) =>
          editing ? calendar.update(editing.id, values) : calendar.create(values)
        }
        onClose={() => setDialog(null)}
      />

      <FormDialog
        open={dialog === 'bulk'}
        title={CALENDAR_COPY.editSelection}
        fields={bulkFields}
        issues={calendar.issues}
        isSaving={calendar.isSaving}
        size="lg"
        onSubmit={async (values) => {
          // An untouched field must leave the whole selection alone
          const filled = Object.fromEntries(
            Object.entries(values).filter(([, value]) => value !== null && value !== '')
          )
          if (Object.keys(filled).length === 0) return true

          const done = await calendar.updateMany(selection, filled)
          if (done) setSelection([])

          return done
        }}
        onClose={() => setDialog(null)}
      />

      <Dialog
        open={dialog === 'detail' && opened !== null}
        title={opened ? [opened.emoji, opened.title].filter(Boolean).join(' ') : ''}
        description={opened ? CALENDAR_SOURCE_REGISTRY.get(opened.source).summary : undefined}
        onClose={() => setDialog(null)}
        footer={
          opened && (opened.href || !opened.readOnly) ? (
            <>
              {opened.href && (
                <Link href={opened.href}>
                  <Button icon="forward" aria-label={ACTION_COPY.open} title={ACTION_COPY.open} />
                </Link>
              )}
              {!opened.readOnly && (
                <>
                  <Button
                    variant="danger"
                    icon="remove"
                    aria-label={ACTION_COPY.delete}
                    title={ACTION_COPY.delete}
                    disabled={!canManage}
                    onClick={() => {
                      setPendingDeletion([opened])
                      setDialog(null)
                    }}
                  />
                  <Button
                    variant="primary"
                    icon="edit"
                    aria-label={ACTION_COPY.edit}
                    title={ACTION_COPY.edit}
                    disabled={!canManage}
                    onClick={() => openForm(opened)}
                  />
                </>
              )}
            </>
          ) : undefined
        }
      >
        {opened && (
          <div className="flex flex-col gap-4">
            <span className="flex flex-wrap items-center gap-2">
              <Badge
                label={CALENDAR_KIND_REGISTRY.label(opened.kind)}
                accent={opened.accent}
                tone="brand"
                dot
              />
              {opened.templateName && (
                <Badge label={opened.templateName} accent={opened.accent} tone="brand" />
              )}
              <Badge
                label={EVENT_VISIBILITY_REGISTRY.label(opened.visibility)}
                tone={toTone(EVENT_VISIBILITY_REGISTRY.get(opened.visibility).accent, 'neutral')}
                icon="visible"
              />
              {opened.readOnly && (
                <Badge label={CALENDAR_COPY.readOnlyNotice} tone="neutral" icon="info" />
              )}
            </span>
            <DetailGrid
              entries={[
                { label: CALENDAR_FIELD_COPY.startsAt, value: formatDayTime(opened.startsAt) },
                {
                  label: CALENDAR_FIELD_COPY.endsAt,
                  value: opened.endsAt ? formatDayTime(opened.endsAt) : undefined,
                },
                { label: CALENDAR_FIELD_COPY.subject, value: opened.subjectName },
                { label: CALENDAR_FIELD_COPY.description, value: opened.description },
              ]}
            />
            {opened.body && <Markdown source={opened.body} />}
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={
          (pendingDeletion?.length ?? 0) > 1
            ? CALENDAR_COPY.deleteManyTitle
            : CALENDAR_COPY.deleteTitle
        }
        description={
          (pendingDeletion?.length ?? 0) > 1
            ? CALENDAR_COPY.deleteManyDescription
            : CALENDAR_COPY.deleteDescription
        }
        pending={calendar.isSaving}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={async () => {
          const ids = (pendingDeletion ?? []).map((entry) => entry.id)
          if (ids.length === 1) await calendar.remove(ids[0])
          else await calendar.removeMany(ids)

          setSelection([])
          setPendingDeletion(null)
        }}
      />
    </>
  )
}
