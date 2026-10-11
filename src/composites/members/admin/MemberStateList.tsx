import { MEMBER_ADMIN_COPY } from '@/declarations/members/admin'
import { ICONS } from '@/declarations/ui/icons'
import { MEMBER_ADMIN } from '@/declarations/ui/variants'
import type { MemberAdminState } from '@/types/members'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

export interface MemberStateListProps {
  state: MemberAdminState
}

type StateTone = keyof typeof MEMBER_ADMIN.stateTones

interface StateLine {
  key: string
  tone: StateTone
  icon: keyof typeof ICONS
  // Before, emphasis, after
  words: readonly [string, string, string]
  date?: string
}

/**
 * Lines telling where the member stands
 * @param {MemberAdminState} state - Resolved state
 * @return {JSX.Element}
 */

export const MemberStateList = ({ state }: MemberStateListProps) => {
  const { suspension, frozenAt, isGone } = state

  // Lines in force
  const lines: StateLine[] = isGone
    ? [{ key: 'gone', tone: 'danger', icon: 'close', words: MEMBER_ADMIN_COPY.stateGone }]
    : [
        suspension
          ? {
              key: 'sanction',
              tone: 'caution',
              icon: 'warning',
              words: MEMBER_ADMIN_COPY.stateSuspended,
              date: suspension.endsAt,
            }
          : {
              key: 'sanction',
              tone: 'success',
              icon: 'picked',
              words: MEMBER_ADMIN_COPY.stateNoSanction,
            },
        frozenAt
          ? {
              key: 'access',
              tone: 'danger',
              icon: 'lock',
              words: MEMBER_ADMIN_COPY.stateAccessFrozen,
              date: frozenAt,
            }
          : {
              key: 'access',
              tone: 'success',
              icon: 'picked',
              words: MEMBER_ADMIN_COPY.stateAccessOpen,
            },
      ]

  return (
    <div className={MEMBER_ADMIN.state}>
      {lines.map(({ key, tone, icon, words, date }) => {
        const Icon = ICONS[icon]
        const [before, emphasis, after] = words.map((part) =>
          part.replace('{date}', date ? formatDay(date) : '')
        )

        return (
          <p key={key} className={MEMBER_ADMIN.stateLine}>
            <Icon
              className={cn(MEMBER_ADMIN.stateGlyph, MEMBER_ADMIN.stateTones[tone])}
              aria-hidden="true"
            />
            <span>
              {before}
              <span className={cn(MEMBER_ADMIN.stateEmphasis, MEMBER_ADMIN.stateTones[tone])}>
                {emphasis}
              </span>
              {after}
            </span>
          </p>
        )
      })}
    </div>
  )
}
