import Link from '@/components/elements/navigation/AppLink'
import { Avatar } from '@/components/elements/display/Avatar'
import { ROUTES } from '@/declarations/navigation'
import { MANAGEMENT_BOARD } from '@/declarations/ui/variants'
import type { ManagedMember } from '@/types/management'

export interface ManagementMemberProps {
  member: ManagedMember
}

/**
 * Member a row concerns, leading to the file
 * @param {ManagedMember} member - Whom the row concerns
 * @return {JSX.Element}
 */

export const ManagementMember = ({ member }: ManagementMemberProps) => (
  <Link href={ROUTES.member(member.id)} className={MANAGEMENT_BOARD.member}>
    <Avatar name={member.displayName} src={member.avatarUrl} size="sm" title="" />
    <span className={MANAGEMENT_BOARD.memberName}>{member.displayName}</span>
  </Link>
)
