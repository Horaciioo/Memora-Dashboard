'use client'

import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { PageOptions, type PageOption } from '@/components/structures/PageOptions'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { Dialog } from '@/components/structures/Dialog'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { Section } from '@/components/structures/Section'
import { AttendancePanel } from '@/composites/calendar/AttendancePanel'
import { CalendarAgenda } from '@/composites/calendar/CalendarAgenda'
import { CalendarEntryChip } from '@/composites/calendar/CalendarEntryChip'
import { CalendarSidebar } from '@/composites/calendar/CalendarSidebar'
import type { CalendarSidebarProps } from '@/composites/calendar/CalendarSidebar'
import { CalendarTimeGrid } from '@/composites/calendar/CalendarTimeGrid'
import type { GridMode } from '@/composites/calendar/CalendarTimeGrid'
import { useCalendar } from '@/core/hooks/data/useCalendar'
import { publishCalendarRail } from '@/core/hooks/interaction/useCalendarRail'
import { useCalendarShortcuts } from '@/core/hooks/interaction/useCalendarShortcuts'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { useSlotDraft } from '@/core/hooks/interaction/useSlotDraft'
import { useCalendarFiltersStore } from '@/core/store/calendarFilters'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { CALENDAR_COPY, CALENDAR_FIELD_COPY, WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import {
  CALENDAR_KIND_REGISTRY,
  CALENDAR_LAYER_REGISTRY,
  CALENDAR_SOURCE_REGISTRY,
  layerOfSource,
} from '@/declarations/calendar/registries'
import { CALENDAR_SETTINGS } from '@/declarations/configurations/settings'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import { ACTION_COPY, PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { accentPaint, accentVars } from '@/declarations/ui/theme'
import { CALENDAR_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'
import { CalendarKinds, CalendarSources } from '@/utils/constants/workflow'
import type { CalendarUnit } from '@/utils/format/calendar'
import {
  atMinute,
  coversDay,
  dayBounds,
  gridRange,
  lastDayKey,
  moveToDay,
  moveToSlot,
  periodLabel,
  shiftAnchor,
  slotEnd,
  toDayKey,
  toFieldValue,
  unitGrid,
  weekdayOf,
} from '@/utils/format/calendar'
import { entrySpan } from '@/utils/format/entrySpan'

export interface CalendarBoardProps {
  initialEntries: CalendarEntry[]
  // Creators in perimeter, the sidebar switching them on and off
  youtubers?: FieldOption[]
  fields: FieldDefinition[]
  anchor: string
  canManage: boolean
  sessionId?: string
  // Opens straight on this entry's detail, for a deep link
  focusEntryId?: string
}

// A week slot identifier pairs its day with its padded hour
const SLOT_SEPARATOR = '|'

// Fields a whole selection can be rewritten with at once
const BULK_FIELD_NAMES = ['kind', 'templateId', 'accountId', 'visibility', 'youtuberId']

// Spans the grid can be read at
const UNITS: { value: CalendarUnit; label: string }[] = [
  { value: 'day', label: CALENDAR_COPY.day },
  { value: 'week', label: CALENDAR_COPY.week },
  { value: 'month', label: CALENDAR_COPY.month },
  { value: 'agenda', label: CALENDAR_COPY.agenda },
]

// Pointer modes of the timed views
const GRID_MODES: { value: GridMode; label: string }[] = [
  { value: 'draw', label: CALENDAR_COPY.modeDraw },
  { value: 'select', label: CALENDAR_COPY.modeSelect },
]

// Day add glyph
const DayAddIcon = ICONS.add

// Glyphs of the detail lines
const ClockIcon = ICONS.clock
const VisibleIcon = ICONS.visible
const RollCallIcon = ICONS.meetings
const InfoIcon = ICONS.info

/**
 * Shared calendar
 * @param {CalendarEntry[]} initialEntries - Entries resolved server-side
 * @param {FieldOption[]} youtubers - Creators in perimeter
 * @param {FieldDefinition[]} fields - Declarations of the entry form
 * @param {string} anchor - ISO day the grid opens on
 * @param {boolean} canManage - Member may post and move entries
 * @param {string} [sessionId] - Bounds the board to one academy session
 * @param {string} [focusEntryId] - Entry the board opens straight onto
 * @return {JSX.Element}
 */

export const CalendarBoard = ({
  initialEntries,
  youtubers = [],
  fields,
  anchor,
  canManage,
  sessionId,
  focusEntryId,
}: CalendarBoardProps) => {
  const calendar = useCalendar(initialEntries, sessionId)

  // A deep link lands with its detail already open, the entry sitting in the first window
  const linked = focusEntryId
    ? (initialEntries.find((row) => row.id === focusEntryId) ?? null)
    : null

  // The span left on is remembered, a session board keeping its own
  const [localUnit, setLocalUnit] = useState<CalendarUnit>('month')
  const [gridMode, setGridMode] = useState<GridMode>('draw')
  const [cursor, setCursor] = useState(anchor)
  const [search, setSearch] = useState('')
  const { can } = useAuthContext()
  const {
    hiddenLayers,
    hiddenCreators,
    toggleLayer,
    toggleCreator,
    unit: storedUnit,
    setUnit: storeUnit,
  } = useCalendarFiltersStore()
  const unit = sessionId ? localUnit : storedUnit
  const setUnit = sessionId ? setLocalUnit : storeUnit

  // Stored choices are read once mounted
  useEffect(() => {
    void useCalendarFiltersStore.persist.rehydrate()
  }, [])

  // Calendars this viewer may read at all
  const layers = useMemo(
    () =>
      CALENDAR_LAYER_REGISTRY.keys.filter((layer) => {
        const permission = CALENDAR_LAYER_REGISTRY.get(layer).permission

        return permission === null || can(permission)
      }),
    [can]
  )
  const [dialog, setDialog] = useState<'form' | 'detail' | 'bulk' | null>(linked ? 'detail' : null)
  const [editing, setEditing] = useState<CalendarEntry | null>(null)
  const [draft, setDraft] = useState<FormValues | null>(null)
  const [opened, setOpened] = useState<CalendarEntry | null>(linked)
  const [selection, setSelection] = useState<string[]>([])
  const [pendingDeletion, setPendingDeletion] = useState<CalendarEntry[] | null>(null)

  const days = useMemo(() => unitGrid(cursor, unit), [cursor, unit])

  const railProps: CalendarSidebarProps = {
    cursor,
    unit,
    onPick: setCursor,
    onCursor: setCursor,
    search,
    onSearch: setSearch,
    layers,
    hiddenLayers,
    onToggleLayer: toggleLayer,
    youtubers,
    hiddenCreators,
    onToggleCreator: toggleCreator,
  }

  // The sidebar carries the month and the switches from md up
  useEffect(() => {
    if (!sessionId) publishCalendarRail(railProps)
  })

  useEffect(() => () => publishCalendarRail(null), [])

  useCalendarShortcuts({
    onToday: () => setCursor(toDayKey(new Date())),
    onStep: (amount) => setCursor((current) => shiftAnchor(current, unit, amount)),
    onUnit: setUnit,
    onCreate: canManage ? () => openForm(null) : undefined,
  })

  const range = useMemo(() => gridRange(days), [days])

  // The server only ever sends the window on screen, so browsing pulls the next one
  useEffect(() => {
    void calendar.load(range.from, range.to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to])

  // A switched off calendar or creator stays out of the grid
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()

    return calendar.entries.filter((entry) => {
      if (entry.id === focusEntryId) return true
      if (hiddenLayers.includes(layerOfSource(entry.source))) return false
      if (entry.youtuberId && hiddenCreators.includes(entry.youtuberId)) return false

      return term.length === 0 || entry.title.toLowerCase().includes(term)
    })
  }, [calendar.entries, hiddenLayers, hiddenCreators, search, focusEntryId])

  // Glyph of the origin of the open entry
  const SourceIcon =
    ICONS[CALENDAR_SOURCE_REGISTRY.get(opened?.source ?? CalendarSources.Entry).icon]

  // The open detail stays in step with roster updates
  const openedEntry = opened
    ? (calendar.entries.find((row) => row.id === opened.id) ?? opened)
    : null

  // Every entry lands in each of the days it runs across
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

  // Opens and closes on the same day
  const isSingleDay = (entry: CalendarEntry) =>
    toDayKey(entry.startsAt) === lastDayKey(entry.startsAt, entry.endsAt)

  const entriesOf = (dayKey: string, kind: string) =>
    (byDay.get(dayKey) ?? []).filter(
      (entry) =>
        entry.kind === kind &&
        // A card belongs to the day it opens on, unless it runs all day across several
        (kind !== CalendarKinds.Event || entry.allDay || toDayKey(entry.startsAt) === dayKey)
    )

  const allDayCards = (dayKey: string) =>
    entriesOf(dayKey, CalendarKinds.Event).filter((entry) => entry.allDay)

  const { over, itemProps, containerProps } = useDragAndDrop((item, container) => {
    const entry = calendar.entries.find((row) => row.id === item.id)
    if (!entry || entry.readOnly) return

    const [dayKey, hour] = container.split(SLOT_SEPARATOR)

    void calendar.move(
      entry.id,
      hour === undefined ? moveToDay(entry.startsAt, dayKey) : moveToSlot(dayKey, Number(hour))
    )
  })

  // A day number opens that day on its own
  const openDay = (dayKey: string) => {
    setCursor(dayKey)
    setUnit('day')
  }

  const openForm = (entry: CalendarEntry | null, prefill?: FormValues) => {
    calendar.clearIssues()
    setEditing(entry)
    setDraft(entry ? null : (prefill ?? null))
    setDialog('form')
  }

  const { covers, slotProps } = useSlotDraft((from, to) => {
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

  const selected = useMemo(
    () => calendar.entries.filter((entry) => selection.includes(entry.id)),
    [calendar.entries, selection]
  )

  const bulkFields = useMemo(
    () => fields.filter((field) => BULK_FIELD_NAMES.includes(field.name)),
    [fields]
  )

  // Both timed views share their markup, only the column count changes
  const isTimed = unit === 'day' || unit === 'week'
  const columns = unit === 'day' ? CALENDAR_STYLES.columnsDay : CALENDAR_STYLES.columnsWeek

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
    entriesOf(dayKey, CalendarKinds.Period).map((entry) => {
      // A single day reads as a bullet line, the month drawing it beneath its own cell
      if (isSingleDay(entry)) return unit === 'month' ? null : renderCard(entry, dayKey, true)

      return (
        <CalendarEntryChip
          key={entry.id}
          entry={entry}
          band
          opensBand={toDayKey(entry.startsAt) === dayKey}
          closesBand={lastDayKey(entry.startsAt, entry.endsAt) === dayKey}
          titled={weekdayOf(dayKey) === 0}
          selected={selection.includes(entry.id)}
          draggable={canManage && !entry.readOnly}
          onOpen={openEntry}
          dragProps={itemProps({ id: entry.id, from: dayKey })}
        />
      )
    })

  /**
   * Draw one card of the grid
   * @param {CalendarEntry} entry - Entry to draw
   * @param {string} container - Drop container it is dragged from
   * @return {JSX.Element}
   */

  const renderCard = (entry: CalendarEntry, container: string, line?: boolean) => (
    <CalendarEntryChip
      key={`${container}:${entry.id}`}
      entry={entry}
      line={line}
      selected={selection.includes(entry.id)}
      draggable={canManage && !entry.readOnly}
      onOpen={openEntry}
      dragProps={itemProps({ id: entry.id, from: container })}
    />
  )

  const pageOptions: PageOption[] = [
    {
      id: 'unit',
      label: PAGE_OPTIONS_COPY.view,
      value: unit,
      choices: UNITS,
      onChange: (value: string) => {
        const next = UNITS.find((entry) => entry.value === value)
        if (next) setUnit(next.value)
      },
    },
  ]

  return (
    <>
      <PageOptions options={pageOptions} />
      <Section description={CALENDAR_COPY.moveHint} bare>
        <div className="flex flex-col gap-6">
          {!sessionId && <CalendarSidebar {...railProps} />}

          <div className="flex min-w-0 flex-col gap-4">
            <div className={CALENDAR_STYLES.toolbar}>
              <Button onClick={() => setCursor(toDayKey(new Date()))}>{CALENDAR_COPY.today}</Button>
              {calendar.isLoading && <BrandLoader variant="ink" />}
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
              <span className="ml-auto flex flex-wrap items-center gap-3">
                {canManage && isTimed && (
                  <SegmentedControl
                    options={GRID_MODES}
                    value={gridMode}
                    onChange={setGridMode}
                    label={CALENDAR_COPY.gridMode}
                  />
                )}
                {canManage && (
                  <span {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.calendarAdd }}>
                    <Button variant="primary" icon="add" onClick={() => openForm(null)}>
                      {CALENDAR_COPY.add}
                    </Button>
                  </span>
                )}
              </span>
            </div>

            {selected.length > 0 && (
              <div className={CALENDAR_STYLES.selectionBar}>
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

            {unit === 'agenda' ? (
              <CalendarAgenda
                days={days}
                entries={visible}
                selection={selection}
                onOpen={openEntry}
              />
            ) : (
              <div className={CALENDAR_STYLES.frame}>
                <div
                  className={cn(
                    CALENDAR_STYLES.weekdays,
                    isTimed
                      ? cn(CALENDAR_STYLES.weekdaysTimed, columns)
                      : CALENDAR_STYLES.weekdaysMonth
                  )}
                >
                  {isTimed ? (
                    <>
                      <span className={CALENDAR_STYLES.weekday} />
                      {days.map((day) => (
                        <span
                          key={day.key}
                          className={cn(CALENDAR_STYLES.weekday, CALENDAR_STYLES.weekdayHead)}
                        >
                          <span>{WEEKDAY_LABELS[weekdayOf(day.key)]}</span>
                          <button
                            type="button"
                            onClick={() => openDay(day.key)}
                            className={cn(
                              CALENDAR_STYLES.dayNumber,
                              CALENDAR_STYLES.dayNumberButton,
                              day.isToday && CALENDAR_STYLES.dayNumberToday
                            )}
                          >
                            {day.dayOfMonth}
                          </button>
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

                {isTimed ? (
                  <>
                    <div className={cn(CALENDAR_STYLES.allDay, columns)}>
                      <span className={CALENDAR_STYLES.allDayLabel}>{CALENDAR_COPY.allDayRow}</span>
                      {days.map((day) => (
                        <div key={day.key} className={CALENDAR_STYLES.allDayCell}>
                          {renderZoneLabels(day.key)}
                          {renderBands(day.key)}
                          {allDayCards(day.key).map((entry) => renderCard(entry, day.key, true))}
                        </div>
                      ))}
                    </div>

                    <CalendarTimeGrid
                      days={days}
                      entries={visible.filter(
                        (entry) => entry.kind === CalendarKinds.Event && !entry.allDay
                      )}
                      agendaExtras={allDayCards}
                      columns={columns}
                      canManage={canManage}
                      mode={gridMode}
                      selection={selection}
                      onDraw={(drawn) =>
                        openForm(null, {
                          kind: CalendarKinds.Event,
                          allDay: false,
                          startsAt: toFieldValue(atMinute(drawn.fromDay, drawn.startMinute)),
                          endsAt: toFieldValue(atMinute(drawn.toDay, drawn.endMinute)),
                        })
                      }
                      onSelectMany={setSelection}
                      onMove={(entry, dayKey, startMinute) =>
                        void calendar.move(entry.id, atMinute(dayKey, startMinute))
                      }
                      onOpen={openEntry}
                      renderZones={renderZones}
                    />
                  </>
                ) : (
                  <div className={CALENDAR_STYLES.month}>
                    {days.map((day) => {
                      // Lines of the day, single day periods reading among the events by time
                      const cards = [
                        ...entriesOf(day.key, CalendarKinds.Period).filter(isSingleDay),
                        ...entriesOf(day.key, CalendarKinds.Event),
                      ].sort((left, right) => left.startsAt.localeCompare(right.startsAt))
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
                          <button
                            type="button"
                            onClick={() => openDay(day.key)}
                            className={cn(
                              CALENDAR_STYLES.dayNumber,
                              CALENDAR_STYLES.dayNumberButton,
                              !day.isCurrentMonth && CALENDAR_STYLES.dayNumberOutside,
                              day.isToday && CALENDAR_STYLES.dayNumberToday
                            )}
                          >
                            {day.dayOfMonth}
                          </button>
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
                          {shown.map((entry) => renderCard(entry, day.key, true))}
                          {hiddenCount > 0 && (
                            <button
                              type="button"
                              onClick={() => openDay(day.key)}
                              className={CALENDAR_STYLES.overflow}
                            >
                              {`+${hiddenCount} ${CALENDAR_COPY.more}`}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Section>

      <FormDrawer
        subject={FORM_SUBJECTS.event}
        open={dialog === 'form'}
        title={editing ? CALENDAR_COPY.edit : CALENDAR_COPY.add}
        fields={fields}
        initialValues={editing?.values ?? draft ?? undefined}
        issues={calendar.issues}
        isSaving={calendar.isSaving}
        onSubmit={(values) =>
          editing ? calendar.update(editing.id, values) : calendar.create(values)
        }
        onClose={() => setDialog(null)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.selection}
        open={dialog === 'bulk'}
        title={CALENDAR_COPY.editSelection}
        fields={bulkFields}
        issues={calendar.issues}
        isSaving={calendar.isSaving}
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
        {opened &&
          (opened.source === CalendarSources.Birthday ? (
            <p className={CALENDAR_STYLES.detailNote}>{CALENDAR_COPY.birthdayMessage}</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className={CALENDAR_STYLES.detailMeta}>
                <span className={CALENDAR_STYLES.previewLine}>
                  <ClockIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                  {entrySpan(opened.startsAt, opened.endsAt, opened.allDay)}
                </span>
                <span className={CALENDAR_STYLES.previewLine}>
                  <SourceIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                  {opened.templateName ?? CALENDAR_KIND_REGISTRY.label(opened.kind)}
                </span>
                <span className={CALENDAR_STYLES.previewLine}>
                  <VisibleIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                  {EVENT_VISIBILITY_REGISTRY.label(opened.visibility)}
                </span>
                {opened.rollCall && (
                  <span className={CALENDAR_STYLES.previewLine}>
                    <RollCallIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                    {CALENDAR_COPY.rollCallTitle}
                  </span>
                )}
                {opened.readOnly && (
                  <span className={CALENDAR_STYLES.previewLine}>
                    <InfoIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                    {CALENDAR_COPY.readOnlyNotice}
                  </span>
                )}
              </div>
              <DetailGrid
                entries={[
                  { label: CALENDAR_FIELD_COPY.subject, value: opened.subjectName },
                  // A planned meeting never shows its description, only its subjects
                  ...(opened.source === CalendarSources.Meeting
                    ? []
                    : [{ label: CALENDAR_FIELD_COPY.description, value: opened.description }]),
                ]}
              />

              {opened.source === CalendarSources.Meeting ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <span className={CALENDAR_STYLES.legendTitle}>
                      {CALENDAR_COPY.meetingTopicsTitle}
                    </span>
                    {opened.topics && opened.topics.length > 0 ? (
                      <ul className={CALENDAR_STYLES.detailList}>
                        {opened.topics.map((topic, index) => (
                          <li key={index}>
                            {[topic.emoji, topic.title].filter(Boolean).join(' ')}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={CALENDAR_STYLES.detailNote}>
                        {CALENDAR_COPY.meetingTopicsEmpty}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className={CALENDAR_STYLES.legendTitle}>
                      {CALENDAR_COPY.meetingMinutesTitle}
                    </span>
                    {opened.minutes ? (
                      <Markdown source={opened.minutes} />
                    ) : (
                      <p className={CALENDAR_STYLES.detailNote}>
                        {CALENDAR_COPY.meetingMinutesEmpty}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                opened.body && <Markdown source={opened.body} />
              )}

              {openedEntry?.rollCall && (
                <AttendancePanel
                  entry={openedEntry}
                  pending={calendar.isSaving}
                  onRespond={(status) => void calendar.respond(openedEntry.id, status)}
                  onRemind={() => void calendar.remind(openedEntry.id)}
                />
              )}
            </div>
          ))}
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
