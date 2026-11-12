import { forbidden } from 'next/navigation'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { isListedRole } from '@/core/lib/members/arrange'
import { MembersPanel } from '@/composites/members/MembersPanel'
import { rowsToOptions } from '@/core/lib/forms/options'
import { listMembers, memberFields } from '@/core/services/members/MemberService'
import { BELOW_LEAD_ROLES } from '@/core/services/members/MemberService/rules'
import { listAcceptedCandidates } from '@/core/services/recruitment'
import { activeFunctions, activeYoutubers, allDivisions } from '@/core/services/reference/lookups'
import { withTwitchBanners } from '@/core/services/platforms/TwitchBannerService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { GONE_MEMBER_STATUSES } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: MEMBER_COPY.title }

/**
 * Moderator list
 * @return {Promise<JSX.Element>} - List page
 */

export default async function MembersPage() {
  const { access, scope, session } = await requirePermission(Permissions.MemberRead)

  // The list is for the encadrement only
  if (!access.isResponsable) forbidden()

  // The three reference reads are memoised
  const perimeter = await scope()

  // A picked creator
  const creatorId =
    perimeter.activeYoutuberId ??
    (!perimeter.isGlobal && perimeter.youtuberIds.length === 1 ? perimeter.youtuberIds[0] : null)

  const [members, fields, divisions, youtubers, functions, accepted] = await Promise.all([
    listMembers(perimeter, access.isAdmin),
    memberFields(access.isAdmin),
    allDivisions(),
    activeYoutubers(),
    activeFunctions(),
    // A card leads to a recruitment file
    access.can(Permissions.RecruitmentRead) ? listAcceptedCandidates(perimeter) : [],
  ])

  // Moderators this member may derank
  const derankIds = access.can(Permissions.MemberUpdate)
    ? members
        .filter(
          (member) =>
            isListedRole(member.role) &&
            !member.isRoot &&
            member.id !== session.id &&
            !GONE_MEMBER_STATUSES.includes(member.status) &&
            (access.isAdmin || BELOW_LEAD_ROLES.includes(member.role))
        )
        .map((member) => member.id)
    : []

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={MEMBER_COPY.title} />
      <MembersPanel
        initialMembers={members}
        accepted={accepted}
        fields={fields}
        divisions={rowsToOptions(divisions)}
        youtubers={rowsToOptions(await withTwitchBanners(youtubers))}
        functions={rowsToOptions(functions)}
        creatorId={creatorId}
        canCreate={access.can(Permissions.MemberCreate)}
        canDelete={access.can(Permissions.MemberDelete)}
        derankIds={derankIds}
        canReadNotes={access.can(Permissions.MemberNoteRead)}
      />
    </div>
  )
}
