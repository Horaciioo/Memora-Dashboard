'use client'

import { Markdown } from '@/components/elements/display/Markdown'
import { AttendancePanel } from '@/composites/calendar/AttendancePanel'
import { CALENDAR_COPY, CALENDAR_FIELD_COPY } from '@/declarations/calendar/copy'
import {
  CALENDAR_KIND_REGISTRY,
  CALENDAR_SOURCE_REGISTRY,
} from '@/declarations/calendar/registries'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import { ICONS } from '@/declarations/ui/icons'
import { accentPaint } from '@/declarations/ui/theme'
import { CALENDAR_DETAIL, CALENDAR_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import type { AttendanceStatusName } from '@/utils/constants/workflow'
import { CalendarSources } from '@/utils/constants/workflow'
import { cn } from '@/utils/classnames'
import { entrySpan } from '@/utils/format/entrySpan'

export interface CalendarDetailProps {
  entry: CalendarEntry
  // Same entry once the roster refreshed
  live: CalendarEntry
  pending: boolean
  onRespond: (status: AttendanceStatusName) => void
  onRemind: () => void
}

const VisibleIcon = ICONS.visible
const PersonIcon = ICONS.members
const InfoIcon = ICONS.info

/**
 * Body of the entry detail modal, when and what first, then content, then the roll-call
 * @param {CalendarEntry} entry - Opened entry
 * @param {CalendarEntry} live - Opened entry with its fresh roster
 * @param {boolean} pending - A mutation is in flight
 * @param {(status: AttendanceStatusName) => void} onRespond - Send Present or Absent
 * @param {() => void} onRemind - Ping the no-answers now
 * @return {JSX.Element}
 */

export const CalendarDetail = ({
  entry,
  live,
  pending,
  onRespond,
  onRemind,
}: CalendarDetailProps) => {
  if (entry.source === CalendarSources.Birthday) {
    return <p className={CALENDAR_STYLES.detailNote}>{CALENDAR_COPY.birthdayMessage}</p>
  }

  const SourceIcon = ICONS[CALENDAR_SOURCE_REGISTRY.get(entry.source).icon]
  const paint = accentPaint(entry.accent, 'brand')
  const isMeeting = entry.source === CalendarSources.Meeting

  return (
    <div className={CALENDAR_DETAIL.body}>
      <div className={cn(CALENDAR_DETAIL.hero, paint.soft)} style={paint.style}>
        <span className={cn(CALENDAR_DETAIL.heroKind, paint.text)}>
          {entry.templateName ?? CALENDAR_KIND_REGISTRY.label(entry.kind)}
        </span>
        <span className={CALENDAR_DETAIL.heroSpan}>
          {entrySpan(entry.startsAt, entry.endsAt, entry.allDay)}
        </span>
        <div className={CALENDAR_DETAIL.facts}>
          <span className={CALENDAR_STYLES.previewLine}>
            <SourceIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
            {CALENDAR_SOURCE_REGISTRY.get(entry.source).label}
          </span>
          <span className={CALENDAR_STYLES.previewLine}>
            <VisibleIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
            {EVENT_VISIBILITY_REGISTRY.label(entry.visibility)}
          </span>
          {entry.subjectName && (
            <span className={CALENDAR_STYLES.previewLine}>
              <PersonIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
              {entry.subjectName}
            </span>
          )}
          {entry.readOnly && (
            <span className={CALENDAR_STYLES.previewLine}>
              <InfoIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
              {CALENDAR_COPY.readOnlyNotice}
            </span>
          )}
        </div>
      </div>

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

      {live.rollCall && (
        <AttendancePanel entry={live} pending={pending} onRespond={onRespond} onRemind={onRemind} />
      )}
    </div>
  )
}
