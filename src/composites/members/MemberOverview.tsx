import { AbsenceReason } from '@/components/elements/display/AbsenceReason'
import { MemberParticipation } from '@/composites/members/MemberParticipation'
import { Section } from '@/components/structures/page/Section'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { MEMBER_FILE } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_STYLES, TASK_LIST } from '@/declarations/ui/variants'
import type { MemberAbsence, MemberParticipation as Participation } from '@/types/members'
import { playPresenceLabel } from '@/core/lib/play/presence'
import type { PlayPresence } from '@/types/play'
import { cn } from '@/utils/classnames'
import { absenceReasonText } from '@/utils/format/absences'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { formatDay, formatDayRange } from '@/utils/format/dates'

export interface MemberOverviewProps {
  absences: MemberAbsence[]
  participations: Participation[]
  playPresence: PlayPresence | null
  onNavigate: (tab: string) => void
}

/**
 * Where a moderator stands right now: available or away, what
 * they did last. Everything links to the tab holding the whole story
 * @param {MemberAbsence[]} absences - Time off
 * @param {Participation[]} participations - Sessions joined
 * @param {PlayPresence | null} playPresence - Game they sit in
 * @param {(tab: string) => void} onNavigate - Opens another tab
 * @return {JSX.Element}
 */

export const MemberOverview = ({
  absences,
  participations,
  playPresence,
  onNavigate,
}: MemberOverviewProps) => {
  const Chevron = ICONS.next
  const PlayIcon = ICONS.play
  const today = new Date().toISOString().slice(0, 10)
  const approved = absences
    .filter((absence) => absence.status === AbsenceStatuses.Approved)
    .sort((left, right) => left.startDate.localeCompare(right.startDate))

  // Away today
  const current = approved.find(
    (absence) => absence.startDate.slice(0, 10) <= today && absence.endDate.slice(0, 10) >= today
  )
  const upcoming = approved.find((absence) => absence.startDate.slice(0, 10) > today)

  const situation = current
    ? {
        icon: 'absences' as const,
        title: MEMBER_COPY.nowAbsent.replace('{date}', formatDay(current.endDate)),
        meta: <AbsenceReason reason={absenceReasonText(current)} />,
      }
    : upcoming
      ? {
          icon: 'absences' as const,
          title: MEMBER_COPY.nowNext.replace(
            '{range}',
            formatDayRange(upcoming.startDate, upcoming.endDate)
          ),
          meta: <AbsenceReason reason={absenceReasonText(upcoming)} />,
        }
      : { icon: 'history' as const, title: MEMBER_COPY.nowFree, meta: null }

  const SituationIcon = ICONS[situation.icon]

  return (
    <div className={MEMBER_FILE.main}>
      <Section title={MEMBER_COPY.nowTitle} raised>
        <button
          type="button"
          className={cn(HOME_STYLES.line, HOME_STYLES.lineLink)}
          onClick={() => onNavigate('absences')}
        >
          <SituationIcon
            className={cn(HOME_STYLES.chipIcon, 'shrink-0 text-[var(--color-ink-accent)]')}
            aria-hidden="true"
          />
          <span className={TASK_LIST.body}>
            <span className={TASK_LIST.title}>{situation.title}</span>
            {situation.meta && <span className={TASK_LIST.meta}>{situation.meta}</span>}
          </span>
          <Chevron className={TASK_LIST.chevron} aria-hidden="true" />
        </button>
        {playPresence && (
          <div className={HOME_STYLES.line}>
            <PlayIcon
              className={cn(HOME_STYLES.chipIcon, 'shrink-0 text-[var(--color-ink-accent)]')}
              aria-hidden="true"
            />
            <span className={TASK_LIST.body}>
              <span className={TASK_LIST.title}>{playPresenceLabel(playPresence)}</span>
            </span>
          </div>
        )}
      </Section>

      <MemberParticipation participations={participations} onNavigate={onNavigate} />
    </div>
  )
}
