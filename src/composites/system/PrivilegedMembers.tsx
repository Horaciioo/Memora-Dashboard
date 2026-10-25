'use client'

import { useRouter } from 'next/navigation'

import { MemberCard } from '@/composites/members/MemberCard'
import { ROUTES } from '@/declarations/navigation'
import { LIST_STYLES } from '@/declarations/ui/variants'
import type { MemberSummary } from '@/types/members'

export interface PrivilegedMembersProps {
  members: MemberSummary[]
}

/**
 * Cards of the Admins and the Employés, each opening its full file
 * @param {MemberSummary[]} members - Accounts to list
 * @return {JSX.Element}
 */

export const PrivilegedMembers = ({ members }: PrivilegedMembersProps) => {
  const router = useRouter()

  return (
    <div className={LIST_STYLES.grid}>
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          showNotesBubble
          canDelete={false}
          onOpen={() => router.push(ROUTES.member(member.id))}
          onDelete={() => undefined}
        />
      ))}
    </div>
  )
}
