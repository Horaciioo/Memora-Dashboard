import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { MembersPanel } from '@/composites/members/MembersPanel'
import { prisma } from '@/core/lib/db'
import { rowsToOptions } from '@/core/lib/forms/options'
import { listMembers, memberFields } from '@/core/services/members/MemberService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: MEMBER_COPY.title }

/**
 * Moderator list
 * @return {Promise<JSX.Element>} - List page
 */

export default async function MembersPage() {
  const { access, scope } = await requirePermission(Permissions.MemberRead)

  const [members, fields, divisions, youtubers, functions] = await Promise.all([
    listMembers(await scope()),
    memberFields(),
    prisma.division.findMany({ orderBy: { rank: 'asc' } }),
    prisma.youtuber.findMany({ orderBy: { position: 'asc' } }),
    prisma.jobFunction.findMany({ orderBy: { position: 'asc' } }),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={MEMBER_COPY.title} lead={MEMBER_COPY.lead} />
      <MembersPanel
        initialMembers={members}
        fields={fields}
        divisions={rowsToOptions(divisions)}
        youtubers={rowsToOptions(youtubers)}
        functions={rowsToOptions(functions)}
        canCreate={access.can(Permissions.MemberCreate)}
        canDelete={access.can(Permissions.MemberDelete)}
        canReadNotes={access.can(Permissions.MemberNoteRead)}
      />
    </div>
  )
}
