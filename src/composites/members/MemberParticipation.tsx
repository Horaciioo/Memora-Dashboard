import Link from '@/components/elements/navigation/AppLink'

import { Section } from '@/components/structures/page/Section'
import { PARTICIPATION_ROLE_COPY, MEMBER_COPY } from '@/declarations/members/copy'
import { ROUTES } from '@/declarations/navigation'
import { MEMBER_FILE } from '@/declarations/ui/blocks'
import { EMPTY_VALUE, HOME_STYLES, TASK_LIST } from '@/declarations/ui/variants'
import type { MemberParticipation as Participation } from '@/types/members'
import { cn } from '@/utils/classnames'
import { formatDay, formatDayRange } from '@/utils/format/dates'

// Sessions previewed before sending to the path tab
const PREVIEW_PARTICIPATION = 3

export interface MemberParticipationProps {
  participations: Participation[]
  onNavigate: (tab: string) => void
}

/**
 * Meta line of one session
 * @param {Participation} entry - Session line
 * @return {string} - Roles, period, interviews
 */

const metaOf = (entry: Participation): string =>
  [
    entry.roles.map((role) => PARTICIPATION_ROLE_COPY[role]).join(', '),
    entry.endsAt ? formatDayRange(entry.startsAt, entry.endsAt) : formatDay(entry.startsAt),
    entry.led > 0 && MEMBER_COPY.participationLed.replace('{count}', String(entry.led)),
    entry.observed > 0 &&
      MEMBER_COPY.participationObserved.replace('{count}', String(entry.observed)),
  ]
    .filter(Boolean)
    .join(' · ')

/**
 * Sessions a moderator took part in
 * @param {Participation[]} participations - Sessions, latest first
 * @param {(tab: string) => void} onNavigate - Opens another tab
 * @return {JSX.Element}
 */

export const MemberParticipation = ({ participations, onNavigate }: MemberParticipationProps) => (
  <Section
    title={MEMBER_COPY.participationTitle}
    action={
      participations.length > PREVIEW_PARTICIPATION && (
        <button type="button" className={MEMBER_FILE.more} onClick={() => onNavigate('path')}>
          {MEMBER_COPY.seeMore}
        </button>
      )
    }
    raised
  >
    {participations.length === 0 && (
      <p className={cn('text-sm', EMPTY_VALUE)}>{MEMBER_COPY.participationEmpty}</p>
    )}
    {participations.slice(0, PREVIEW_PARTICIPATION).map((entry) => {
      const body = (
        <span className={TASK_LIST.body}>
          <span className={TASK_LIST.title}>{entry.title}</span>
          <span className={TASK_LIST.meta}>{metaOf(entry)}</span>
        </span>
      )
      const href =
        entry.kind === 'recruitment' ? ROUTES.recruitment(entry.id) : ROUTES.session(entry.id)

      return entry.canOpen ? (
        <Link key={entry.id} href={href} className={cn(HOME_STYLES.line, HOME_STYLES.lineLink)}>
          {body}
        </Link>
      ) : (
        <div key={entry.id} className={HOME_STYLES.line}>
          {body}
        </div>
      )
    })}
  </Section>
)
