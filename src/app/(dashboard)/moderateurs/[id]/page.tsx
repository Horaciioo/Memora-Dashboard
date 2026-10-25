import type { Metadata } from 'next'
import { forbidden, notFound } from 'next/navigation'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { MemberFileTabs } from '@/composites/members/MemberFileTabs'
import { readMemberModeration } from '@/core/services/lives/MemberModerationService'
import {
  NOTE_FIELDS,
  socialFormFields,
  readOverrides,
} from '@/core/services/members/MemberFileService'
import { nullIfMissing } from '@/core/lib/errors'
import { layerKey } from '@/core/lib/permissions'
import { ABSENCE_FIELDS, canReviewAbsence } from '@/core/services/absences/AbsenceService'
import { readInheritedGrants } from '@/core/services/auth/GrantsService'
import { assertAccountInScope } from '@/core/services/auth/ScopeService'
import { readSealState, sealFields, sealValues } from '@/core/services/auth/SealService'
import { BELOW_LEAD_ROLES, memberFields, readMember } from '@/core/services/members/MemberService'
import { readAdminState } from '@/core/services/members/admin'
import { findCandidateFile } from '@/core/services/recruitment/RecruitmentService'
import { readMemberActivity } from '@/core/services/system/ActivityService'
import { readPlayActivity, readPlayAdmin, readPlayPresence } from '@/core/services/play'
import { PLAY_TARGET } from '@/declarations/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import type { MemberTag } from '@/types/members'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

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
 * Resolve what inheritance grants a member on each layer they can be overridden on
 * @param {string} id - Account identifier
 * @param {MemberTag[]} youtubers - Creators the member is attached to
 * @return {Promise<Record<string, PermissionName[]>>} - Baseline per layer
 */

const readMemberBaselines = async (
  id: string,
  youtubers: MemberTag[]
): Promise<Record<string, PermissionName[]>> => {
  const layers = [null, ...youtubers.map((creator) => creator.id)]
  const resolved = await Promise.all(layers.map((layer) => readInheritedGrants(id, layer)))

  return Object.fromEntries(layers.map((layer, index) => [layerKey(layer), resolved[index]]))
}

/**
 * Moderator file
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Detail page
 */

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, access, scope } = await requirePermission(Permissions.MemberRead)

  // Responsables open a file, only the admin level its own
  if (!access.isResponsable || (id === session.id && !access.isAdmin)) forbidden()

  const canManageAccess = access.can(Permissions.AccessManage)
  const canReadLogs = access.can(Permissions.MemberLogRead)
  const canReadNotes = access.can(Permissions.MemberNoteRead)

  const perimeter = await scope()
  const detail = await assertAccountInScope(id, perimeter, session.id)
    .then(() => readMember(id, canReadNotes))
    .catch(nullIfMissing)
  if (!detail) notFound()

  // A Responsable reads only those below them
  if (!access.isAdmin && !BELOW_LEAD_ROLES.includes(detail.summary.role)) forbidden()

  // Only the responsables of their creators
  const isConcerned =
    perimeter.isGlobal ||
    detail.summary.youtubers.some((tag) => perimeter.youtuberIds.includes(tag.id))
  const canReadModeration = access.can(Permissions.LiveLogRead) && isConcerned

  // Heavy gestures reach the members below, never oneself nor the root
  const canLead =
    access.isResponsable &&
    id !== session.id &&
    !detail.summary.isRoot &&
    (access.isAdmin || BELOW_LEAD_ROLES.includes(detail.summary.role))

  const [
    fields,
    activity,
    overrides,
    inherited,
    recruitment,
    seal,
    canPostAbsence,
    socialFields,
    moderation,
    adminState,
    playPresence,
    playActivity,
    playAdmin,
  ] = await Promise.all([
    memberFields(access.isAdmin),
    canReadLogs ? readMemberActivity(id, undefined, [PLAY_TARGET]) : Promise.resolve([]),
    canManageAccess ? readOverrides(id) : Promise.resolve({}),
    canManageAccess ? readMemberBaselines(id, detail.summary.youtubers) : Promise.resolve({}),
    access.can(Permissions.RecruitmentRead)
      ? findCandidateFile(detail.summary.discordId, perimeter)
      : Promise.resolve(null),
    readSealState(),
    access.can(Permissions.AbsenceReview) && session.id !== id
      ? canReviewAbsence(session.id, id, access.isAdmin)
      : Promise.resolve(false),
    socialFormFields(),
    canReadModeration ? readMemberModeration(id) : Promise.resolve(undefined),
    canLead ? readAdminState(id) : Promise.resolve(null),
    readPlayPresence(id),
    canReadLogs ? readPlayActivity(id) : Promise.resolve([]),
    canLead && access.can(Permissions.PlayManage) ? readPlayAdmin(id) : Promise.resolve(null),
  ])

  // Sensitive values never leave the server while the window is shut
  const sealed = {
    ...detail,
    values: sealValues(detail.values, seal.isUnsealed),
  }

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={detail.summary.displayName} image={detail.summary.bannerUrl} />
      <MemberFileTabs
        detail={sealed}
        recruitmentSessionId={recruitment?.sessionId ?? null}
        memberFields={sealFields(fields, seal.isUnsealed)}
        noteFields={NOTE_FIELDS}
        socialFields={socialFields}
        absenceFields={ABSENCE_FIELDS}
        activity={activity}
        overrides={overrides}
        inherited={inherited}
        canUpdate={access.can(Permissions.MemberUpdate)}
        canReadNotes={canReadNotes}
        canWriteNotes={access.can(Permissions.MemberNoteWrite)}
        canReadLogs={canReadLogs}
        canManageAccess={canManageAccess}
        canPostAbsence={canPostAbsence}
        moderation={moderation}
        canOpenReports={access.can(Permissions.LiveLogRead)}
        adminState={adminState}
        canDelete={access.can(Permissions.MemberDelete)}
        playPresence={playPresence}
        playActivity={playActivity}
        playAdmin={playAdmin}
      />
    </div>
  )
}
