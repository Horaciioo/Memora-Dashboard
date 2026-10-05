import Link from 'next/link'

import { Avatar } from '@/components/elements/display/Avatar'
import { Glyph } from '@/components/elements/display/Glyph'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_FLOW } from '@/declarations/ui/variants'
import type { HomeBirthday, HomeMeeting } from '@/types/personal'
import { cn } from '@/utils/classnames'
import { formatDayKey, isSameDay, parseDay, timeLabel } from '@/utils/format/days'

export interface HomeAgendaProps {
  meetings: HomeMeeting[]
  birthdays: HomeBirthday[]
  canOpenMeeting: boolean
}

// What one line of the agenda carries
interface AgendaLine {
  key: string
  at: Date
  isAllDay: boolean
  title: string
  emoji: string | null
  avatar: { name: string; src: string | null } | null
  href: string | null
}

/**
 * Meetings and birthdays to come
 * @param {HomeMeeting[]} meetings - Coming meetings
 * @param {HomeBirthday[]} birthdays - Coming birthdays
 * @param {boolean} canOpenMeeting - Member may open a meeting file
 * @return {JSX.Element}
 */

export const HomeAgenda = ({ meetings, birthdays, canOpenMeeting }: HomeAgendaProps) => {
  const Cake = ICONS.birthday
  const today = new Date()

  const lines: AgendaLine[] = [
    ...meetings.map((meeting) => ({
      key: `meeting:${meeting.id}`,
      at: parseDay(meeting.scheduledAt),
      isAllDay: false,
      title: meeting.title,
      emoji: meeting.emoji,
      avatar: null,
      href: canOpenMeeting ? ROUTES.meeting(meeting.id) : null,
    })),
    ...birthdays.map((birthday) => ({
      key: `birthday:${birthday.accountId}:${birthday.day}`,
      at: parseDay(birthday.day),
      isAllDay: true,
      title: PERSONAL_COPY.birthdayOf.replace('{name}', birthday.displayName),
      emoji: null,
      avatar: { name: birthday.displayName, src: birthday.avatarUrl },
      href: null,
    })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime() || Number(b.isAllDay) - Number(a.isAllDay))

  if (lines.length === 0) return <p className={HOME_FLOW.quiet}>{PERSONAL_COPY.aheadEmpty}</p>

  const days = new Map<string, AgendaLine[]>()
  for (const line of lines) {
    const key = formatDayKey(line.at)
    days.set(key, [...(days.get(key) ?? []), line])
  }

  const heading = (date: Date) => {
    const label = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })

    return label.charAt(0).toUpperCase() + label.slice(1)
  }

  return (
    <div className={HOME_FLOW.agenda}>
      {[...days.entries()].map(([key, group]) => {
        const first = group[0]!.at
        const isToday = isSameDay(first, today)
        // The time column only exists on days that hold a timed line
        const hasTimes = group.some((line) => !line.isAllDay)

        return (
          <div key={key} className={HOME_FLOW.day}>
            <h3 className={cn(HOME_FLOW.dayHead, isToday && HOME_FLOW.dayToday)}>
              {isToday ? `${PERSONAL_COPY.birthdayToday}, ${heading(first)}` : heading(first)}
            </h3>
            {group.map((line) => {
              const body = (
                <>
                  {hasTimes && (
                    <span className={HOME_FLOW.agendaTime}>
                      {line.isAllDay ? '' : timeLabel(line.at)}
                    </span>
                  )}
                  {line.avatar ? (
                    <Avatar name={line.avatar.name} src={line.avatar.src} size="xs" />
                  ) : line.emoji ? (
                    <Glyph value={line.emoji} size="row" />
                  ) : (
                    <Cake className={HOME_FLOW.agendaGlyph} aria-hidden="true" />
                  )}
                  <span className={HOME_FLOW.agendaTitle}>{line.title}</span>
                </>
              )

              return line.href ? (
                <Link
                  key={line.key}
                  href={line.href}
                  className={cn(HOME_FLOW.agendaRow, HOME_FLOW.agendaLink)}
                >
                  {body}
                </Link>
              ) : (
                <div key={line.key} className={HOME_FLOW.agendaRow}>
                  {body}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
