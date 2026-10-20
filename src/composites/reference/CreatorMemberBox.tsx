'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { MultiSelect } from '@/components/elements/forms/selects/MultiSelect'
import { TEAM_COPY } from '@/declarations/teams/copy'
import { CREATOR_FILE } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import type { FieldOption } from '@/types/forms'
import type { CreatorTeamMember } from '@/types/teams'
import { cn } from '@/utils/classnames'

export interface CreatorMemberBoxProps {
  member: CreatorTeamMember
  options: FieldOption[]
  canManage: boolean
  isSaving: boolean
  onChange: (functionIds: string[]) => void
}

/**
 * Moderator box, opens on its teams
 * @param {CreatorTeamMember} member - Moderator shown
 * @param {FieldOption[]} options - Teams on offer
 * @param {boolean} canManage - Viewer may seat members
 * @param {boolean} isSaving - Mutation in flight
 * @param {(functionIds: string[]) => void} onChange - Teams picked
 * @return {JSX.Element}
 */

export const CreatorMemberBox = ({
  member,
  options,
  canManage,
  isSaving,
  onChange,
}: CreatorMemberBoxProps) => {
  const [isOpen, setOpen] = useState(false)
  const Chevron = ICONS.expand
  const joined = options.filter((option) => member.functionIds.includes(option.value))

  return (
    <article className={CREATOR_FILE.box}>
      <button
        type="button"
        aria-expanded={isOpen}
        disabled={!canManage}
        onClick={() => setOpen((current) => !current)}
        className={CREATOR_FILE.boxHead}
      >
        <Avatar name={member.person.name} src={member.person.src} size="md" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={CREATOR_FILE.boxName}>{member.person.name}</span>
          <span className={joined.length > 0 ? CREATOR_FILE.boxMeta : CREATOR_FILE.boxMetaEmpty}>
            {joined.length > 0 ? joined.map((option) => option.label).join(', ') : TEAM_COPY.noTeam}
          </span>
        </span>
        {canManage && (
          <Chevron
            className={cn(CREATOR_FILE.chevron, isOpen && CREATOR_FILE.chevronOpen)}
            aria-hidden="true"
          />
        )}
      </button>
      <div className={isOpen ? CREATOR_FILE.foldOpen : CREATOR_FILE.fold} aria-hidden={!isOpen}>
        <div className={CREATOR_FILE.foldClip}>
          <div className={CREATOR_FILE.foldBody}>
            <MultiSelect
              id={`member-teams-${member.person.id}`}
              value={member.functionIds}
              options={options}
              label={TEAM_COPY.memberTeams}
              emptyLabel={TEAM_COPY.noTeam}
              mark="glyph"
              disabled={isSaving || !isOpen}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
