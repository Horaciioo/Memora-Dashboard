import { Section } from '@/components/structures/Section'
import { ActivityTimeline } from '@/components/structures/ActivityTimeline'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { MEMBER_FILE } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_STYLES, TASK_LIST } from '@/declarations/ui/variants'
import type { MemberAbsence, MemberNote } from '@/types/members'
import { cn } from '@/utils/classnames'
import { absenceReasonText } from '@/utils/format/absences'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { formatDay, formatDayRange, formatDayTime } from '@/utils/format/dates'

// Notes and journal lines previewed before sending to the full tab
const PREVIEW_NOTES = 3
const PREVIEW_ACTIVITY = 4

export interface MemberOverviewProps {
  absences: MemberAbsence[]
  notes: MemberNote[]
  activity: ActivityEntry[]
  canReadNotes: boolean
  canReadLogs: boolean
  onNavigate: (tab: string) => void
}

/**
 * Where a moderator stands right now: available or away, what was pinned about them, what
 * they did last. Everything links to the tab holding the whole story
 * @param {MemberAbsence[]} absences - Time off, any status
 * @param {MemberNote[]} notes - Private remarks
 * @param {ActivityEntry[]} activity - Journal entries, newest first
 * @param {boolean} canReadNotes - Viewer may read notes
 * @param {boolean} canReadLogs - Viewer may read the journal
 * @param {(tab: string) => void} onNavigate - Opens another tab
 * @return {JSX.Element}
 */

export const MemberOverview = ({
  absences,
  notes,
  activity,
  canReadNotes,
  canReadLogs,
  onNavigate,
}: MemberOverviewProps) => {
  const Chevron = ICONS.next
  const today = new Date().toISOString().slice(0, 10)
  const approved = absences
    .filter((absence) => absence.status === AbsenceStatuses.Approved)
    .sort((left, right) => left.startDate.localeCompare(right.startDate))

  // Away today, else the next one on the calendar
  const current = approved.find(
    (absence) => absence.startDate.slice(0, 10) <= today && absence.endDate.slice(0, 10) >= today
  )
  const upcoming = approved.find((absence) => absence.startDate.slice(0, 10) > today)

  const situation = current
    ? {
        icon: 'absences' as const,
        title: MEMBER_COPY.nowAbsent.replace('{date}', formatDay(current.endDate)),
        meta: absenceReasonText(current),
      }
    : upcoming
      ? {
          icon: 'absences' as const,
          title: MEMBER_COPY.nowNext.replace(
            '{range}',
            formatDayRange(upcoming.startDate, upcoming.endDate)
          ),
          meta: absenceReasonText(upcoming),
        }
      : { icon: 'success' as const, title: MEMBER_COPY.nowFree, meta: null }

  const SituationIcon = ICONS[situation.icon]
  const pinned = notes.filter((note) => note.pinned).slice(0, PREVIEW_NOTES)

  return (
    <div className={MEMBER_FILE.main}>
      <Section title={MEMBER_COPY.nowTitle} raised>
        <button
          type="button"
          className={cn(HOME_STYLES.line, HOME_STYLES.lineLink)}
          onClick={() => onNavigate('absences')}
        >
          <span className={HOME_STYLES.chip}>
            <SituationIcon className={HOME_STYLES.chipIcon} aria-hidden="true" />
          </span>
          <span className={TASK_LIST.body}>
            <span className={TASK_LIST.title}>{situation.title}</span>
            {situation.meta && <span className={TASK_LIST.meta}>{situation.meta}</span>}
          </span>
          <Chevron className={TASK_LIST.chevron} aria-hidden="true" />
        </button>
      </Section>

      {canReadNotes && pinned.length > 0 && (
        <Section
          title={MEMBER_COPY.pinnedTitle}
          action={
            <button type="button" className={MEMBER_FILE.more} onClick={() => onNavigate('notes')}>
              {MEMBER_COPY.seeMore}
            </button>
          }
          bare
        >
          <div className={MEMBER_FILE.notesGrid}>
            {pinned.map((note) => (
              <article key={note.id} className={cn(MEMBER_FILE.note, MEMBER_FILE.notePinned)}>
                <span className={MEMBER_FILE.noteHead}>
                  {[note.authorName, formatDayTime(note.createdAt)].filter(Boolean).join(' · ')}
                </span>
                <p className={MEMBER_FILE.noteBody}>{note.body}</p>
              </article>
            ))}
          </div>
        </Section>
      )}

      {canReadLogs && activity.length > 0 && (
        <Section
          title={MEMBER_COPY.recentTitle}
          action={
            <button type="button" className={MEMBER_FILE.more} onClick={() => onNavigate('logs')}>
              {MEMBER_COPY.seeMore}
            </button>
          }
          raised
        >
          <ActivityTimeline entries={activity.slice(0, PREVIEW_ACTIVITY)} />
        </Section>
      )}
    </div>
  )
}
