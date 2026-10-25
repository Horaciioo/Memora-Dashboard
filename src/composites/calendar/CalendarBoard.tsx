'use client'

import Link from '@/components/elements/navigation/AppLink'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { Button } from '@/components/elements/actions/Button'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { PageOptions, type PageOption } from '@/components/structures/page/PageOptions'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { Section } from '@/components/structures/page/Section'
import { CalendarDetail } from '@/composites/calendar/CalendarDetail'
import { CalendarAgenda } from '@/composites/calendar/CalendarAgenda'
import { groupOpenSlots } from '@/core/lib/calendar/slotRanges'
import { PeriodFrameLayer } from '@/composites/calendar/PeriodFrameLayer'
import { seatRuns } from '@/core/lib/calendar/periodLanes'
import { periodRuns } from '@/core/lib/calendar/periodRuns'
import { ZoneTitleLayer } from '@/composites/calendar/ZoneTitleLayer'
import { chunkDays, zoneTitleSpots } from '@/core/lib/calendar/zoneTitles'
import { CalendarEntryChip } from '@/composites/calendar/CalendarEntryChip'
import { CalendarMobileBar } from '@/composites/calendar/CalendarMobileBar'
import { MobilePeriodBars } from '@/composites/calendar/MobilePeriodBars'
import { MeetingRequest } from '@/composites/calendar/MeetingRequest'
import type { CalendarSidebarProps } from '@/composites/calendar/CalendarSidebar'
import { CalendarTimeGrid } from '@/composites/calendar/CalendarTimeGrid'
import type { GridMode } from '@/composites/calendar/CalendarTimeGrid'
import { useCalendar } from '@/core/hooks/data/work/useCalendar'
import { publishCalendarRail } from '@/core/hooks/interaction/calendar/useCalendarRail'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/useBreakpoint'
import { useSwipe } from '@/core/hooks/interaction/gestures/useSwipe'
import { useCalendarShortcuts } from '@/core/hooks/interaction/calendar/useCalendarShortcuts'
import { useDragAndDrop } from '@/core/hooks/interaction/gestures/useDragAndDrop'
import { useSlotDraft } from '@/core/hooks/interaction/state/useSlotDraft'
import { useCalendarFiltersStore } from '@/core/store/calendarFilters'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { CALENDAR_COPY, WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import {
  CALENDAR_LAYER_REGISTRY,
  CALENDAR_SOURCE_REGISTRY,
  layerOfEntry,
} from '@/declarations/calendar/registries'
import { CALENDAR_SETTINGS } from '@/declarations/configurations/settings'
import { ACTION_COPY, PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { accentPaint, accentVars } from '@/declarations/ui/theme'
import { CALENDAR_MOBILE, CALENDAR_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'
import { CalendarKinds } from '@/utils/constants/workflow'
import type { CalendarLayerName } from '@/utils/constants/workflow'
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

export interface CalendarBoardProps {
  // Form opened on arrival, with these values
  startWith?: FormValues
  initialEntries: CalendarEntry[]
  // Creators in perimeter
  youtubers?: FieldOption[]
  fields: FieldDefinition[]
  anchor: string
  canManage: boolean
  sessionId?: string
  // Opens straight on this entry's detail
  focusEntryId?: string
  // Calendar left on alone
  onlyLayer?: CalendarLayerName
}

// A week slot identifier pairs its day with its padded hour
const SLOT_SEPARATOR = '|'

// Fields a whole selection can be rewritten with at once
const BULK_FIELD_NAMES = ['kind', 'templateId', 'accountId', 'visibility', 'youtuberId']

// Spans the grid can be read at
const UNITS: { value: CalendarUnit; label: string }[] = [
  { value: 'day', label: CALENDAR_COPY.day },
  { value: 'threeDays', label: CALENDAR_COPY.threeDays },
  { value: 'week', label: CALENDAR_COPY.week },
  { value: 'month', label: CALENDAR_COPY.month },
  { value: 'agenda', label: CALENDAR_COPY.agenda },
]

// Views in the order a phone lists them
const MOBILE_UNITS: { value: CalendarUnit; label: string }[] = [
  { value: 'agenda', label: CALENDAR_COPY.agenda },
  { value: 'day', label: CALENDAR_COPY.day },
  { value: 'threeDays', label: CALENDAR_COPY.threeDays },
  { value: 'week', label: CALENDAR_COPY.week },
  { value: 'month', label: CALENDAR_COPY.month },
]

// Buttons stepping the period
const STEPS = [
  { amount: -1, icon: 'back', title: CALENDAR_COPY.previous, short: CALENDAR_COPY.previousShort },
  { amount: 1, icon: 'forward', title: CALENDAR_COPY.next, short: CALENDAR_COPY.nextShort },
] as const

// Pointer modes of the timed views
const GRID_MODES: { value: GridMode; label: string }[] = [
  { value: 'draw', label: CALENDAR_COPY.modeDraw },
  { value: 'select', label: CALENDAR_COPY.modeSelect },
]

// Day add glyph
const DayAddIcon = ICONS.add

/**
 * Shared calendar
 * @param {CalendarEntry[]} initialEntries - Entries resolved server-side
 * @param {FieldOption[]} youtubers - Creators in perimeter
 * @param {FieldDefinition[]} fields - Declarations of the entry form
 * @param {string} anchor - ISO day the grid opens on
 * @param {boolean} canManage - Member may post and move entries
 * @param {string} [sessionId] - Bounds the board to one academy session
 * @param {string} [focusEntryId] - Entry the board opens straight onto
 * @param {CalendarLayerName} [onlyLayer] - Calendar left on alone when the board opens
 * @param {FormValues} [startWith] - Values the form opens with on arrival
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
  onlyLayer,
  startWith,
}: CalendarBoardProps) => {
  const calendar = useCalendar(initialEntries, sessionId)
  const isMobile = useIsMobileShell()

  // A deep link lands with its detail already open
  const linked = focusEntryId
    ? (initialEntries.find((row) => row.id === focusEntryId) ?? null)
    : null

  // The span left on is remembered
  const [localUnit, setLocalUnit] = useState<CalendarUnit>('month')
  const [gridMode, setGridMode] = useState<GridMode>('draw')
  const [cursor, setCursor] = useState(anchor)
  const [search, setSearch] = useState('')
  const { can } = useAuthContext()
  const {
    hiddenLayers,
    hiddenCreators,
    hiddenKinds,
    toggleKind,
    toggleLayer,
    setHiddenLayers,
    toggleCreator,
    setHiddenCreators,
    unit: storedUnit,
    setUnit: storeUnit,
  } = useCalendarFiltersStore()
  const unit = sessionId ? localUnit : storedUnit
  const setUnit = sessionId ? setLocalUnit : storeUnit

  // Stored choices are read once mounted
  useEffect(() => {
    void useCalendarFiltersStore.persist.rehydrate()
  }, [])

  // Home link solo, never stored
  const [soloLayer, setSoloLayer] = useState(onlyLayer ?? null)

  // Calendars this viewer may read at all
  const layers = useMemo(
    () =>
      CALENDAR_LAYER_REGISTRY.keys.filter((layer) => {
        const permission = CALENDAR_LAYER_REGISTRY.get(layer).permission

        return permission === null || can(permission)
      }),
    [can]
  )

  // Only switchable calendars hide
  const shownHidden = useMemo(
    () =>
      soloLayer
        ? layers.filter((layer) => layer !== soloLayer)
        : hiddenLayers.filter((layer) => layers.includes(layer)),
    [soloLayer, layers, hiddenLayers]
  )

  // First flip leaves the solo
  const flipLayer = (layer: CalendarLayerName) => {
    if (!soloLayer) return toggleLayer(layer)

    setHiddenLayers(shownHidden.filter((hidden) => hidden !== layer))
    setSoloLayer(null)
  }
  const [dialog, setDialog] = useState<'form' | 'detail' | 'bulk' | null>(
    linked ? 'detail' : startWith ? 'form' : null
  )
  const [editing, setEditing] = useState<CalendarEntry | null>(null)
  const [draft, setDraft] = useState<FormValues | null>(startWith ?? null)
  const [opened, setOpened] = useState<CalendarEntry | null>(linked)
  const [selection, setSelection] = useState<string[]>([])
  // Day under the pointer, its zones show their titles
  const [hoverDay, setHoverDay] = useState<string | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<CalendarEntry[] | null>(null)

  // A phone follows one creator at a time, hiding the others
  const soloId =
    hiddenCreators.length > 0 && youtubers.length - hiddenCreators.length === 1
      ? (youtubers.find((option) => !hiddenCreators.includes(option.value))?.value ?? '')
      : ''
  const soloCreator = (creatorId: string) =>
    setHiddenCreators(
      creatorId
        ? youtubers.filter((option) => option.value !== creatorId).map((option) => option.value)
        : []
    )

  const days = useMemo(() => unitGrid(cursor, unit), [cursor, unit])

  // A day number opens that day on its own
  const openDay = (dayKey: string) => {
    setCursor(dayKey)
    setUnit('day')
  }

  // A swipe steps the period
  const { handlers: swipe, axisStyle } = useSwipe({
    axis: 'x',
    enabled: isMobile,
    onSwipe: (direction) => setCursor(shiftAnchor(cursor, unit, direction === 'left' ? 1 : -1)),
  })

  const railProps: CalendarSidebarProps = {
    cursor,
    unit,
    onPick: openDay,
    onCursor: setCursor,
    search,
    onSearch: setSearch,
    layers,
    hiddenLayers: shownHidden,
    onToggleLayer: flipLayer,
    hiddenKinds,
    onToggleKind: toggleKind,
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

  // The server only ever sends the window on screen
  useEffect(() => {
    void calendar.load(range.from, range.to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to])

  // A switched off calendar or creator stays out of the grid
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return calendar.entries.filter((entry) => {
      if (entry.id === focusEntryId) return true
      if (shownHidden.includes(layerOfEntry(entry))) return false
      if (hiddenKinds.includes(entry.kind)) return false
      if (entry.youtuberId && hiddenCreators.includes(entry.youtuberId)) return false

      return term.length === 0 || entry.title.toLowerCase().includes(term)
    })
  }, [calendar.entries, shownHidden, hiddenKinds, hiddenCreators, search, focusEntryId])

  // Open slots of the annual reviews are folded into stretches, hundreds of quarters stay light
  const visible = useMemo(() => groupOpenSlots(filtered), [filtered])

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

  // Started earlier, shown on the first day
  const cardDayOf = (entry: CalendarEntry) => {
    const opening = toDayKey(entry.startsAt)
    const firstDay = days[0]?.key ?? opening

    return opening < firstDay ? firstDay : opening
  }
  const entriesOf = (dayKey: string, kind: string) =>
    (byDay.get(dayKey) ?? []).filter(
      (entry) =>
        entry.kind === kind &&
        // A card belongs to the day it opens on
        (kind !== CalendarKinds.Event || entry.allDay || cardDayOf(entry) === dayKey)
    )

  // Each zone names itself once, across the widest run of days it fills
  const dayRows = unit === 'month' ? chunkDays(days) : [days]
  const titleSpots = zoneTitleSpots(
    dayRows.map((row) => row.map((day) => day.key)),
    (dayKey) => entriesOf(dayKey, CalendarKinds.Zone)
  )

  // Periods of several days are framed around what they hold
  const periodsOn = (dayKey: string) =>
    entriesOf(dayKey, CalendarKinds.Period).filter((entry) => !isSingleDay(entry))
  const runs = periodRuns(
    dayRows.map((row) => row.map((day) => day.key)),
    periodsOn,
    (entry) => toDayKey(entry.startsAt),
    (entry) => lastDayKey(entry.startsAt, entry.endsAt)
  )

  const hoveredZones = hoverDay
    ? entriesOf(hoverDay, CalendarKinds.Zone).map((zone) => zone.id)
    : []

  // A new entry lands in view, on its own day when the month cell is full
  const revealCreated = (entry: CalendarEntry) => {
    const dayKey = toDayKey(entry.startsAt)
    setCursor(dayKey)
    if (
      unit === 'month' &&
      entriesOf(dayKey, CalendarKinds.Event).length >= CALENDAR_SETTINGS.maxEntriesPerDay
    ) {
      setUnit('day')
    }
  }

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

  const openForm = (entry: CalendarEntry | null, prefill?: FormValues) => {
    calendar.clearIssues()
    setEditing(entry)
    setDraft(entry ? null : (prefill ?? null))
    setDialog('form')
  }

  const { covers, slotProps } = useSlotDraft((from, to) => {
    const [fromDay, fromHour] = from.split(SLOT_SEPARATOR)
    const [toDay, toHour] = to.split(SLOT_SEPARATOR)

    // A slide across hours makes an event
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
    // A modifier key gathers a selection
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

  // A stretch of open slots stands for each of its slots
  const selected = useMemo(() => {
    const picked = visible.filter((entry) => selection.includes(entry.id))
    const ids = new Set(
      picked.flatMap((entry) =>
        entry.slot === 'range' ? (entry.values.rangeIds as string[]) : [entry.id]
      )
    )

    return calendar.entries.filter((entry) => ids.has(entry.id))
  }, [calendar.entries, selection, visible])

  const bulkFields = useMemo(
    () => fields.filter((field) => BULK_FIELD_NAMES.includes(field.name)),
    [fields]
  )

  // Both timed views share their markup
  const isTimed = unit === 'day' || unit === 'threeDays' || unit === 'week'
  const columns = {
    day: CALENDAR_STYLES.columnsDay,
    threeDays: CALENDAR_STYLES.columnsThreeDays,
    week: CALENDAR_STYLES.columnsWeek,
  }[unit as 'day' | 'threeDays' | 'week']

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
      // A single day reads as a bullet line
      if (isSingleDay(entry)) return unit === 'month' ? null : renderCard(entry, dayKey, true)

      // The frame draws it from a desktop up, a phone writes it as a bar under the day numbers
      if (unit === 'month') return null

      return (
        <div key={entry.id} className="md:hidden">
          <CalendarEntryChip
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
        </div>
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
          <div className="flex min-w-0 flex-col gap-4">
            <CalendarMobileBar
              title={periodLabel(cursor, unit)}
              unit={unit}
              units={MOBILE_UNITS}
              onUnit={setUnit}
              cursor={cursor}
              onCursor={setCursor}
              onToday={() => setCursor(toDayKey(new Date()))}
              isLoading={calendar.isLoading}
              youtubers={youtubers}
              soloId={soloId}
              onSolo={soloCreator}
              railProps={sessionId ? undefined : railProps}
              extra={!canManage ? <MeetingRequest /> : undefined}
            />

            <div className={CALENDAR_STYLES.toolbar}>
              <div className={CALENDAR_STYLES.toolbarMain}>
                <Button onClick={() => setCursor(toDayKey(new Date()))}>
                  {CALENDAR_COPY.today}
                </Button>
                {calendar.isLoading && <BrandLoader variant="ink" />}
                {STEPS.map(({ amount, title, short }) => (
                  <Button
                    key={amount}
                    title={title}
                    onClick={() => setCursor(shiftAnchor(cursor, unit, amount))}
                  >
                    {short}
                  </Button>
                ))}
                <span className={CALENDAR_STYLES.period}>{periodLabel(cursor, unit)}</span>
              </div>
              <div className={CALENDAR_STYLES.toolbarTools}>
                {canManage && isTimed && (
                  <SegmentedControl
                    options={GRID_MODES}
                    value={gridMode}
                    onChange={setGridMode}
                    label={CALENDAR_COPY.gridMode}
                  />
                )}
                {!canManage && <MeetingRequest />}
                {canManage && (
                  <span {...(isMobile ? {} : { [BEACON_ATTRIBUTE]: GUIDE_BEACONS.calendarAdd })}>
                    <Button variant="primary" onClick={() => openForm(null)}>
                      {CALENDAR_COPY.add}
                    </Button>
                  </span>
                )}
              </div>
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
                  onClick={() => {
                    calendar.clearIssues()
                    setDialog('bulk')
                  }}
                >
                  {CALENDAR_COPY.editSelection}
                </Button>
                <Button variant="danger" onClick={() => setPendingDeletion(selected)}>
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
              <div className={CALENDAR_STYLES.frame} style={axisStyle} {...swipe}>
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
                        <span className="md:hidden">{label.charAt(0)}</span>
                        <span className="hidden md:inline">{label}</span>
                      </span>
                    ))
                  )}
                </div>

                {isTimed ? (
                  <>
                    <div className={cn(CALENDAR_STYLES.allDay, columns)}>
                      <span className={CALENDAR_STYLES.allDayLabel}>{CALENDAR_COPY.allDayRow}</span>
                      {days.map((day) => (
                        <div
                          key={day.key}
                          className={CALENDAR_STYLES.allDayCell}
                          onMouseEnter={() => setHoverDay(day.key)}
                          onMouseLeave={() => setHoverDay(null)}
                        >
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
                      onHoverDay={setHoverDay}
                      zoneTitles={
                        <>
                          <ZoneTitleLayer
                            spots={titleSpots}
                            bands={days.map((day) => renderZones(day.key))}
                            shownIds={hoveredZones}
                            columns={days.length}
                            className="inset-y-0 right-0 left-11 md:left-16"
                          />
                          <PeriodFrameLayer
                            runs={runs}
                            columns={days.length}
                            onOpen={(entry) => openEntry(entry, false)}
                            className="inset-y-0 right-0 left-11 md:left-16"
                          />
                        </>
                      }
                    />
                  </>
                ) : (
                  <div className={CALENDAR_STYLES.month} onMouseLeave={() => setHoverDay(null)}>
                    {dayRows.map((week, weekIndex) => {
                      const weekRuns = runs.filter((run) => run.row === weekIndex)
                      // A phone writes the periods as bars under the day numbers
                      const seated = seatRuns(weekRuns)

                      return (
                        <div key={week[0]?.key} className={CALENDAR_STYLES.monthWeek}>
                          <div className="hidden md:contents">
                            <ZoneTitleLayer
                              spots={titleSpots.filter((spot) => spot.row === weekIndex)}
                              bands={week.map((day) => renderZones(day.key))}
                              shownIds={hoveredZones}
                              columns={week.length}
                              cap="5rem"
                              className="inset-0"
                            />
                            <PeriodFrameLayer
                              runs={weekRuns}
                              columns={week.length}
                              onOpen={(entry) => openEntry(entry, false)}
                              className="inset-0"
                            />
                          </div>
                          <MobilePeriodBars
                            placed={seated.placed}
                            columns={week.length}
                            onOpen={(entry) => openEntry(entry, false)}
                          />
                          {week.map((day) => {
                            // Lines of the day
                            const cards = [
                              ...entriesOf(day.key, CalendarKinds.Period).filter(isSingleDay),
                              ...entriesOf(day.key, CalendarKinds.Event),
                            ].sort((left, right) => left.startsAt.localeCompare(right.startsAt))
                            const shown = cards.slice(
                              0,
                              isMobile
                                ? CALENDAR_SETTINGS.maxEntriesPerDayMobile
                                : CALENDAR_SETTINGS.maxEntriesPerDay
                            )
                            const hiddenCount = cards.length - shown.length

                            return (
                              <div
                                key={day.key}
                                className={cn(
                                  CALENDAR_STYLES.day,
                                  !day.isCurrentMonth && CALENDAR_STYLES.dayOutside,
                                  covers(day.key) && CALENDAR_STYLES.dayDrafted,
                                  periodsOn(day.key).length > 0 && CALENDAR_STYLES.periodRoom,
                                  over === day.key && 'is-drop-target'
                                )}
                                {...(canManage ? containerProps(day.key) : {})}
                                {...slotProps(day.key)}
                                onMouseEnter={() => setHoverDay(day.key)}
                                onClick={isMobile ? () => openDay(day.key) : undefined}
                              >
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
                                <span
                                  aria-hidden="true"
                                  className={CALENDAR_MOBILE.laneSpacer}
                                  style={{ height: `${seated.lanes * 1.375}rem` }}
                                />
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
                                    <span className="md:hidden">•••</span>
                                    <span className="hidden md:inline">
                                      {`+${hiddenCount}`}
                                      <span className="hidden sm:inline">
                                        {' '}
                                        {CALENDAR_COPY.more}
                                      </span>
                                    </span>
                                  </button>
                                )}
                              </div>
                            )
                          })}
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

      {/* A phone adds from a button floating over the grid */}
      {canManage && (
        <span {...(isMobile ? { [BEACON_ATTRIBUTE]: GUIDE_BEACONS.calendarAdd } : {})}>
          <Button
            variant="primary"
            icon="add"
            aria-label={CALENDAR_COPY.add}
            className={CALENDAR_STYLES.fab}
            onClick={() => openForm(null)}
          />
        </span>
      )}

      <FormDrawer
        subject={FORM_SUBJECTS.event}
        open={dialog === 'form'}
        title={editing ? CALENDAR_COPY.edit : CALENDAR_COPY.add}
        fields={fields}
        initialValues={editing?.values ?? draft ?? undefined}
        issues={calendar.issues}
        isSaving={calendar.isSaving}
        onSubmit={async (values) => {
          if (editing) return calendar.update(editing.id, values)

          const created = await calendar.create(values)
          if (created) revealCreated(created)

          return created !== null
        }}
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

          const done = await calendar.updateMany(
            selected.map((entry) => entry.id),
            filled
          )
          if (done) setSelection([])

          return done
        }}
        onClose={() => setDialog(null)}
      />

      <Dialog
        open={dialog === 'detail' && opened !== null}
        title={opened ? [opened.emoji, opened.title].filter(Boolean).join(' ') : ''}
        description={opened ? CALENDAR_SOURCE_REGISTRY.get(opened.source).summary : undefined}
        size={
          opened?.slot === 'range' ? 'xl' : opened?.slot ? 'sm' : opened?.rollCall ? 'xl' : 'md'
        }
        onClose={() => setDialog(null)}
        footer={
          opened && (opened.href || !opened.readOnly) ? (
            <>
              {opened.href && (
                <Link href={opened.href}>
                  <Button>{ACTION_COPY.open}</Button>
                </Link>
              )}
              {!opened.readOnly && (
                <>
                  <Button
                    variant="danger"
                    disabled={!canManage}
                    onClick={() => {
                      setPendingDeletion([opened])
                      setDialog(null)
                    }}
                  >
                    {ACTION_COPY.delete}
                  </Button>
                  <Button
                    variant="primary"
                    className="text-white!"
                    disabled={!canManage}
                    onClick={() => openForm(opened)}
                  >
                    {ACTION_COPY.edit}
                  </Button>
                </>
              )}
            </>
          ) : undefined
        }
      >
        {opened && (
          <CalendarDetail
            entry={opened}
            live={openedEntry ?? opened}
            pending={calendar.isSaving}
            onRespond={(status, hours) => void calendar.respond(opened.id, status, hours)}
            onMove={(accountId, status) => void calendar.moveAttendee(opened.id, accountId, status)}
            onRemind={() => void calendar.remind(opened.id)}
            onTakeSlot={!canManage ? () => void calendar.takeSlot(opened.id) : undefined}
            slotRange={calendar.entries.filter((slot) =>
              ((opened.values.rangeIds as string[] | undefined) ?? []).includes(slot.id)
            )}
            onPickSlot={(slot) => openEntry(slot, false)}
            slotAdmin={
              canManage
                ? {
                    openSlots: calendar.entries.filter(
                      (slot) =>
                        slot.slot === 'open' &&
                        slot.id !== opened.id &&
                        slot.values.projectId === opened.values.projectId
                    ),
                    onPlace: (accountId) => void calendar.placeSlot(opened.id, accountId),
                    onCancel: (moveTo) => void calendar.cancelSlot(opened.id, moveTo),
                    onClearOpen: () => void calendar.clearOpenSlots(opened.id),
                  }
                : undefined
            }
          />
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
