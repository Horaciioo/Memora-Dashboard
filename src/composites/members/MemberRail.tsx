import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { DivisionLogo } from '@/components/elements/display/DivisionLogo'
import { FunctionEmblems } from '@/composites/members/MemberBadges'
import { MEMBER_STATUS_REGISTRY, ROLE_REGISTRY } from '@/declarations/access/roles'
import { ERASED_COPY } from '@/declarations/academy/parkour'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { divisionLogo, divisionMark } from '@/declarations/members/profiles'
import { MEMBER_BLOCK, MEMBER_FILE } from '@/declarations/ui/blocks'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import type { MemberSummary } from '@/types/members'
import { MemberStatuses } from '@/utils/constants/hierarchy'

// Ends of a PIM
const ERASED_STATUSES: string[] = [MemberStatuses.Dismissed, MemberStatuses.Resigned]

export interface MemberRailProps {
  summary: MemberSummary
  canEdit: boolean
  isLocked: boolean
  onEditPortrait: () => void
  // Property groups
  children: ReactNode
}

/**
 * Identity rail of a moderator file: who they are at a glance, then every property edited
 * in place, always in view whichever tab is open
 * @param {MemberSummary} summary - Row of the moderator
 * @param {boolean} canEdit - Viewer may change the file
 * @param {boolean} isLocked - Root account
 * @param {() => void} onEditPortrait - Opens the identity form
 * @param {ReactNode} children - Property groups
 * @return {JSX.Element}
 */

export const MemberRail = ({
  summary,
  canEdit,
  isLocked,
  onEditPortrait,
  children,
}: MemberRailProps) => {
  const AbsentIcon = ICONS.absences

  return (
    <aside className={MEMBER_FILE.rail}>
      <div className={MEMBER_FILE.head}>
        <div className={MEMBER_BLOCK.frame}>
          <button
            type="button"
            disabled={!canEdit}
            aria-label={ACTION_COPY.edit}
            title={ACTION_COPY.edit}
            onClick={onEditPortrait}
            className={MEMBER_BLOCK.portrait}
          >
            <Avatar name={summary.displayName} src={summary.avatarUrl} size="xl" />
          </button>
          {summary.division &&
            (divisionLogo(summary.division.label, summary.division.imagePath) ? (
              <DivisionLogo
                label={summary.division.label}
                src={summary.division.imagePath}
                className={MEMBER_BLOCK.divisionLogo}
              />
            ) : (
              <span className={MEMBER_BLOCK.division} title={summary.division.label}>
                {divisionMark(summary.division.label)}
                <span className="sr-only">{summary.division.label}</span>
              </span>
            ))}
        </div>
        <span className={MEMBER_FILE.name}>{summary.displayName}</span>
        <span className={MEMBER_FILE.role}>{ROLE_REGISTRY.label(summary.role)}</span>
        <FunctionEmblems
          member={summary}
          className={MEMBER_FILE.functions}
          glyphClassName="h-6 w-6"
        />
        {ERASED_STATUSES.includes(summary.status) && (
          <span className={MEMBER_FILE.departed} title={ERASED_COPY.notice}>
            {MEMBER_STATUS_REGISTRY.label(summary.status)}
          </span>
        )}
        {summary.isAbsent && (
          <span className={MEMBER_FILE.status}>
            <AbsentIcon className={MEMBER_FILE.statusGlyph} aria-hidden="true" />
            {MEMBER_COPY.absent}
          </span>
        )}
      </div>
      {isLocked && <p className={MEMBER_FILE.lock}>{MEMBER_COPY.rootLocked}</p>}
      <div className={MEMBER_FILE.body}>{children}</div>
    </aside>
  )
}
