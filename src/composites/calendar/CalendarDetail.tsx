'use client'

import { RecordId } from '@/components/elements/display/RecordId'
import { Markdown } from '@/components/elements/display/Markdown'
import { Button } from '@/components/elements/actions/Button'
import { AnnualSlotAdmin } from '@/composites/calendar/AnnualSlotAdmin'
import type { AnnualSlotAdminProps } from '@/composites/calendar/AnnualSlotAdmin'
import { AttendanceAnswer } from '@/composites/calendar/AttendanceAnswer'
import { AttendanceRoster } from '@/composites/calendar/AttendanceRoster'
import {
  ANNUAL_REVIEW_COPY,
  AUDIENCE_COPY,
  CALENDAR_COPY,
  CALENDAR_FIELD_COPY,
} from '@/declarations/calendar/copy'
import {
  CALENDAR_KIND_REGISTRY,
  CALENDAR_SOURCE_REGISTRY,
} from '@/declarations/calendar/registries'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import { ICONS } from '@/declarations/ui/icons'
import { CALENDAR_DETAIL, CALENDAR_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import type { AttendanceStatusName } from '@/utils/constants/workflow'
import { CalendarKinds, CalendarSources } from '@/utils/constants/workflow'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { formatClock } from '@/utils/format/dates'
import { entrySpanParts } from '@/utils/format/entrySpan'

export interface CalendarDetailProps {
  entry: CalendarEntry
  // Same entry once the roster refreshed
  live: CalendarEntry
  pending: boolean
  onRespond: (status: AttendanceStatusName, hours?: { from: string; to: string }) => void
  onMove: (accountId: string, status: AttendanceStatusName) => void
  onRemind: () => void
  // Takes an open slot of the annual reviews, offered to the Moderators
  onTakeSlot?: () => void
  // What a Responsable does with a slot of the annual reviews
  slotAdmin?: Omit<AnnualSlotAdminProps, 'entry' | 'pending'>
  // Slots a stretch of open slots stands for, and what opens one of them
  slotRange?: CalendarEntry[]
  onPickSlot?: (slot: CalendarEntry) => void
}

const PersonIcon = ICONS.members
const InfoIcon = ICONS.info
const LinkIcon = ICONS.chain
const IdentifierIcon = ICONS.identifier

/**
 * Body of the entry detail modal, when and what first, then content, then the roll-call
 * @param {CalendarEntry} entry - Opened entry
 * @param {CalendarEntry} live - Opened entry with its fresh roster
 * @param {boolean} pending - A mutation is in flight
 * @param {(status: AttendanceStatusName, hours?: { from: string, to: string }) => void} onRespond - Send Present or Absent
 * @param {(accountId: string, status: AttendanceStatusName) => void} onMove - Move a member on the roll-call
 * @param {() => void} onRemind - Ping the no-answers now
 * @param {() => void} [onTakeSlot] - Take an open slot
 * @param {Omit<AnnualSlotAdminProps, 'entry' | 'pending'>} [slotAdmin] - Responsable tools on a slot
 * @param {CalendarEntry[]} [slotRange] - Slots of a stretch of open slots
 * @param {(slot: CalendarEntry) => void} [onPickSlot] - Open one of them
 * @return {JSX.Element}
 */

export const CalendarDetail = ({
  entry,
  live,
  pending,
  onRespond,
  onMove,
  onRemind,
  onTakeSlot,
  slotAdmin,
  slotRange,
  onPickSlot,
}: CalendarDetailProps) => {
  const { isAdmin } = useAuthContext()
  const copy = useCopy(CALENDAR_COPY.linkCopied)

  if (entry.source === CalendarSources.Birthday) {
    return <p className={CALENDAR_STYLES.detailNote}>{CALENDAR_COPY.birthdayMessage}</p>
  }

  const SourceIcon = ICONS[CALENDAR_SOURCE_REGISTRY.get(entry.source).icon]
  // A plain event is already named by its source
  const typeLabel =
    entry.templateName ??
    (entry.kind === CalendarKinds.Event ? null : CALENDAR_KIND_REGISTRY.label(entry.kind))
  const KindIcon = ICONS[CALENDAR_KIND_REGISTRY.get(entry.kind).icon]
  const isMeeting = entry.source === CalendarSources.Meeting
  const visibility = EVENT_VISIBILITY_REGISTRY.get(entry.visibility)
  const VisibilityIcon = ICONS[visibility.icon ?? 'visible']
  // Short address, copied on click
  const shortLink = `${window.location.host}/${entry.id}`
  const isLeadsOnly = entry.values.audienceLeadsOnly === true

  const main = (
    <div className={CALENDAR_DETAIL.main}>
      <section className={CALENDAR_DETAIL.section}>
        <h3 className={SECTION_STYLES.title}>{CALENDAR_COPY.infoTitle}</h3>
        <div className={CALENDAR_DETAIL.card}>
          <span className={CALENDAR_DETAIL.heroSpan}>
            {entrySpanParts(entry.startsAt, entry.endsAt, entry.allDay).map((part, index) =>
              part.strong ? <strong key={index}>{part.text}</strong> : part.text
            )}
          </span>
          <div className={CALENDAR_DETAIL.rule} role="separator" />
          <div className={CALENDAR_DETAIL.facts}>
            {typeLabel && (
              <span className={CALENDAR_STYLES.previewLine}>
                <KindIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                {typeLabel}
              </span>
            )}
            <span className={CALENDAR_STYLES.previewLine}>
              <SourceIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
              {CALENDAR_SOURCE_REGISTRY.get(entry.source).label}
            </span>
            <span className={CALENDAR_STYLES.previewLine}>
              <VisibilityIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
              {isLeadsOnly ? AUDIENCE_COPY.leadsOnlyLabel : visibility.label}
            </span>
            {entry.source === CalendarSources.Entry && entry.slot !== 'range' && (
              <span className={CALENDAR_STYLES.previewLine}>
                <LinkIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                <button
                  type="button"
                  className={CALENDAR_STYLES.detailLink}
                  onClick={() => void copy(shortLink)}
                >
                  {shortLink}
                </button>
              </span>
            )}
            {isAdmin && entry.slot !== 'range' && (
              <span className={CALENDAR_STYLES.previewLine}>
                <IdentifierIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                {FIELD_COPY.id}
                <RecordId id={entry.id} />
              </span>
            )}
            {entry.subjectName && (
              <span className={CALENDAR_STYLES.previewLine}>
                <PersonIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                {entry.subjectName}
              </span>
            )}
            {entry.readOnly && entry.slot !== 'range' && (
              <span className={CALENDAR_STYLES.previewLine}>
                <InfoIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                {CALENDAR_COPY.readOnlyNotice}
              </span>
            )}
          </div>
        </div>
      </section>

      {isMeeting ? (
        <>
          <section className={CALENDAR_DETAIL.section}>
            <h3 className={SECTION_STYLES.title}>{CALENDAR_COPY.meetingTopicsTitle}</h3>
            <div className={CALENDAR_DETAIL.card}>
              {entry.topics && entry.topics.length > 0 ? (
                <ul className={CALENDAR_STYLES.detailList}>
                  {entry.topics.map((topic, index) => (
                    <li key={index}>{[topic.emoji, topic.title].filter(Boolean).join(' ')}</li>
                  ))}
                </ul>
              ) : (
                <p className={CALENDAR_STYLES.detailNote}>{CALENDAR_COPY.meetingTopicsEmpty}</p>
              )}
            </div>
          </section>
          <section className={CALENDAR_DETAIL.section}>
            <h3 className={SECTION_STYLES.title}>{CALENDAR_COPY.meetingMinutesTitle}</h3>
            <div className={CALENDAR_DETAIL.card}>
              {entry.minutes ? (
                <Markdown source={entry.minutes} />
              ) : (
                <p className={CALENDAR_STYLES.detailNote}>{CALENDAR_COPY.meetingMinutesEmpty}</p>
              )}
            </div>
          </section>
        </>
      ) : (
        (entry.description || entry.body) && (
          <section className={CALENDAR_DETAIL.section}>
            <h3 className={SECTION_STYLES.title}>{CALENDAR_FIELD_COPY.description}</h3>
            <div className={CALENDAR_DETAIL.card}>
              {entry.description && (
                <p className="text-sm whitespace-pre-line">{entry.description}</p>
              )}
              {entry.body && <Markdown source={entry.body} />}
            </div>
          </section>
        )
      )}
    </div>
  )

  // An open slot of the annual reviews is taken from here
  const take =
    live.slot === 'open' && onTakeSlot ? (
      <section className={CALENDAR_DETAIL.section}>
        <Button variant="primary" disabled={pending} onClick={onTakeSlot}>
          {ANNUAL_REVIEW_COPY.takeSlot}
        </Button>
      </section>
    ) : slotAdmin && live.slot ? (
      <AnnualSlotAdmin entry={live} pending={pending} {...slotAdmin} />
    ) : null

  // A stretch of open slots: the hours to pick from, each one opens its own slot
  if (live.slot === 'range') {
    return (
      <div className={CALENDAR_DETAIL.split}>
        <div className={CALENDAR_DETAIL.main}>{main}</div>
        <div className={CALENDAR_DETAIL.splitDivider} role="separator" />
        <section className={CALENDAR_DETAIL.section}>
          <h3 className={SECTION_STYLES.title}>{ANNUAL_REVIEW_COPY.pickSlot}</h3>
          <div className={CALENDAR_DETAIL.slotPicks}>
            {(slotRange ?? []).map((slot) => (
              <button
                key={slot.id}
                type="button"
                className={CALENDAR_DETAIL.slotPick}
                onClick={() => onPickSlot?.(slot)}
              >
                {formatClock(slot.startsAt)}
              </button>
            ))}
          </div>
        </section>
      </div>
    )
  }

  // A slot of the annual reviews concerns one member: their state, no roll-call panel
  if (live.slot) {
    const roster = live.attendance
    const person = roster ? [...roster.present, ...roster.absent, ...roster.pending][0] : null
    const name = person?.name ?? live.subjectName
    const state = roster
      ? roster.present.length > 0
        ? ANNUAL_REVIEW_COPY.slotPresent
        : roster.absent.length > 0
          ? ANNUAL_REVIEW_COPY.slotAbsent
          : ANNUAL_REVIEW_COPY.slotPending
      : ANNUAL_REVIEW_COPY.slotPresent

    return (
      <div className={CALENDAR_DETAIL.body}>
        {main}
        {live.slot === 'taken' && name && roster?.mine == null && (
          <p className={CALENDAR_DETAIL.answered}>{state.replace('{name}', name)}</p>
        )}
        {roster?.mine != null && (
          <AttendanceAnswer entry={live} pending={pending} onRespond={onRespond} />
        )}
        {take}
      </div>
    )
  }

  if (!live.rollCall) {
    return (
      <div className={CALENDAR_DETAIL.body}>
        {main}
        {take}
      </div>
    )
  }

  return (
    <div className={CALENDAR_DETAIL.split}>
      <div className={CALENDAR_DETAIL.main}>
        {main}
        {take}
        <AttendanceAnswer entry={live} pending={pending} onRespond={onRespond} />
      </div>
      <div className={CALENDAR_DETAIL.splitDivider} role="separator" />
      <AttendanceRoster entry={live} pending={pending} onMove={onMove} onRemind={onRemind} />
    </div>
  )
}
