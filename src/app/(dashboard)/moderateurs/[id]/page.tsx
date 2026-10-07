import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
import { MemberFileTabs } from '@/composites/members/MemberFileTabs'
import { readMemberModeration } from '@/core/services/lives/MemberModerationService'
import {
  NOTE_FIELDS,
  socialFormFields,
  readOverrides,
} from '@/core/services/members/MemberFileService'
import { layerKey } from '@/core/lib/permissions'
import { ABSENCE_FIELDS, canReviewAbsence } from '@/core/services/absences/AbsenceService'
import { readInheritedGrants } from '@/core/services/auth/GrantsService'
import { assertAccountInScope } from '@/core/services/auth/ScopeService'
import { readSealState, sealFields, sealValues } from '@/core/services/auth/SealService'
import { memberFields, readMember } from '@/core/services/members/MemberService'
import { findCandidateFile } from '@/core/services/recruitment/RecruitmentService'
import { readMemberActivity } from '@/core/services/system/ActivityService'
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

  const canManageAccess = access.can(Permissions.AccessManage)
  const canReadLogs = access.can(Permissions.MemberLogRead)
  const canReadNotes = access.can(Permissions.MemberNoteRead)

  const perimeter = await scope()
  const detail = await assertAccountInScope(id, perimeter, session.id)
    .then(() => readMember(id, canReadNotes))
    .catch(() => null)
  if (!detail) notFound()

  // Only the responsables of their creators
  const isConcerned =
    perimeter.isGlobal ||
    detail.summary.youtubers.some((tag) => perimeter.youtuberIds.includes(tag.id))
  const canReadModeration = access.can(Permissions.LiveLogRead) && isConcerned

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
  ] = await Promise.all([
    memberFields(access.isAdmin),
    canReadLogs ? readMemberActivity(id) : Promise.resolve([]),
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
  ])

  // Sensitive values never leave the server while the window is shut
  const sealed = {
    ...detail,
    values: sealValues(detail.values, seal.isUnsealed),
    email: seal.isUnsealed ? detail.email : null,
    phone: seal.isUnsealed ? detail.phone : null,
  }

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={detail.summary.displayName} />
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
      />
    </div>
  )
}
