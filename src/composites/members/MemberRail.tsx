import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { InlineText } from '@/components/structures/inline/InlineText'
import { FunctionEmblems, RoleGlyph } from '@/composites/members/MemberBadges'
import { MEMBER_STATUS_REGISTRY } from '@/declarations/access/roles'
import { ERASED_COPY } from '@/declarations/academy/parkour'
import { MEMBER_ADMIN_COPY } from '@/declarations/members/admin'
import { MEMBER_COPY } from '@/declarations/members/copy'
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
  isFrozen?: boolean
  onEditPortrait: () => void
  onRename: (value: string) => Promise<boolean>
  // Property groups
  children: ReactNode
}

/**
 * Identity rail of a moderator file: who they are at a glance, then every property edited
 * in place, always in view whichever tab is open
 * @param {MemberSummary} summary - Row of the moderator
 * @param {boolean} canEdit - Viewer may change the file
 * @param {boolean} isLocked - Root account
 * @param {boolean} [isFrozen] - Access shut
 * @param {() => void} onEditPortrait - Opens the identity form
 * @param {(value: string) => Promise<boolean>} onRename - Persists the new name
 * @param {ReactNode} children - Property groups
 * @return {JSX.Element}
 */

export const MemberRail = ({
  summary,
  canEdit,
  isLocked,
  isFrozen,
  onEditPortrait,
  onRename,
  children,
}: MemberRailProps) => {
  const AbsentIcon = ICONS.absences

  return (
    <aside className={MEMBER_FILE.rail}>
      <div className={MEMBER_FILE.head}>
        <div className={MEMBER_BLOCK.frameCompact}>
          <button
            type="button"
            disabled={!canEdit}
            aria-label={ACTION_COPY.edit}
            title={ACTION_COPY.edit}
            onClick={onEditPortrait}
            className={MEMBER_BLOCK.portrait}
          >
            <Avatar
              name={summary.displayName}
              src={summary.avatarUrl}
              size="lg"
              className="md:h-24 md:w-24 md:text-2xl"
            />
          </button>
          <span className={MEMBER_BLOCK.roleMarkCompact}>
            <RoleGlyph
              role={summary.role}
              isRoot={summary.isRoot}
              glyphClassName={MEMBER_BLOCK.roleGlyphCompact}
            />
          </span>
        </div>
        <InlineText
          id="member-display-name"
          value={summary.displayName}
          disabled={!canEdit}
          className={MEMBER_FILE.name}
          onCommit={onRename}
        />
        <FunctionEmblems
          member={summary}
          className={MEMBER_FILE.functions}
          glyphClassName="h-5 w-5 md:h-6 md:w-6"
        />
        {ERASED_STATUSES.includes(summary.status) && (
          <span className={MEMBER_FILE.departed} title={ERASED_COPY.notice}>
            {MEMBER_STATUS_REGISTRY.label(summary.status)}
          </span>
        )}
        {isFrozen && <span className={MEMBER_FILE.departed}>{MEMBER_ADMIN_COPY.frozenDone}</span>}
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
