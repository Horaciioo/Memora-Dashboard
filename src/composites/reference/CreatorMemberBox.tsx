import { Avatar } from '@/components/elements/display/Avatar'
import { TEAM_COPY } from '@/declarations/teams/copy'
import { CREATOR_FILE } from '@/declarations/ui/blocks'
import type { FieldOption } from '@/types/forms'
import type { CreatorTeamMember } from '@/types/teams'

export interface CreatorMemberBoxProps {
  member: CreatorTeamMember
  options: FieldOption[]
}

/**
 * Moderator box, the functions they hold at this creator
 * @param {CreatorTeamMember} member - Moderator shown
 * @param {FieldOption[]} options - Functions open for the creator
 * @return {JSX.Element}
 */

export const CreatorMemberBox = ({ member, options }: CreatorMemberBoxProps) => {
  const held = options.filter((option) => member.functionIds.includes(option.value))

  return (
    <article className={CREATOR_FILE.box}>
      <div className={CREATOR_FILE.boxHead}>
        <Avatar name={member.person.name} src={member.person.src} size="md" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={CREATOR_FILE.boxName}>{member.person.name}</span>
          <span className={held.length > 0 ? CREATOR_FILE.boxMeta : CREATOR_FILE.boxMetaEmpty}>
            {held.length > 0 ? held.map((option) => option.label).join(', ') : TEAM_COPY.noTeam}
          </span>
        </span>
      </div>
    </article>
  )
}
