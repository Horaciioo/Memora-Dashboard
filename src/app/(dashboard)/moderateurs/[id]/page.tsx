import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
import { MemberFileTabs } from '@/composites/members/MemberFileTabs'
import {
  NOTE_FIELDS,
  SOCIAL_FIELDS,
  readOverrides,
} from '@/core/services/members/MemberFileService'
import { memberFields, readMember } from '@/core/services/members/MemberService'
import { readMemberActivity } from '@/core/services/system/ActivityService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Name the browser tab after the moderator
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const member = await readMember(id)

    return { title: member.summary.displayName }
  } catch {
    return { title: MEMBER_COPY.title }
  }
}

/**
 * Moderator file
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Detail page
 */

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { access } = await requirePermission(Permissions.MemberRead)

  const canManageAccess = access.can(Permissions.AccessManage)
  const canReadLogs = access.can(Permissions.MemberLogRead)
  const canReadNotes = access.can(Permissions.MemberNoteRead)

  const detail = await readMember(id, canReadNotes).catch(() => null)
  if (!detail) notFound()

  const [fields, activity, overrides] = await Promise.all([
    memberFields(),
    canReadLogs ? readMemberActivity(id) : Promise.resolve([]),
    canManageAccess ? readOverrides(id) : Promise.resolve([]),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader eyebrow={detail.summary.discordId} title={detail.summary.displayName} />
      <MemberFileTabs
        detail={detail}
        memberFields={fields}
        noteFields={NOTE_FIELDS}
        socialFields={SOCIAL_FIELDS}
        activity={activity}
        overrides={overrides}
        canUpdate={access.can(Permissions.MemberUpdate)}
        canReadNotes={canReadNotes}
        canWriteNotes={access.can(Permissions.MemberNoteWrite)}
        canReadLogs={canReadLogs}
        canManageAccess={canManageAccess}
      />
    </div>
  )
}
