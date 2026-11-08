import 'server-only'
import { prisma } from '@/core/lib/db'
import { withoutSealedWrites } from '@/core/services/auth/SealService'
import { allDivisions } from '@/core/services/reference/lookups'
import { immutable, notFound } from '@/core/lib/errors'
import { syncTemporarySeats } from '@/core/services/members/seats'
import { syncFunctionTeams } from '@/core/services/teams/FunctionTeamService'
import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import { activeAbsenceFilter } from '@/core/services/absences/AbsenceService'
import { fileUrl } from '@/core/services/system/FileService'
import { isRootIdentity } from '@/declarations/access/identity'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { LEAD_DIVISION_RANK } from '@/declarations/reference/fixed'
import type { FormValues } from '@/types/forms'
import type { MemberSummary } from '@/types/members'
import { MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'
import type { MemberRoleName, MemberStatusName } from '@/utils/constants/hierarchy'
import { FunctionKinds } from '@/utils/constants/workflow'
import type { FunctionKindName } from '@/utils/constants/workflow'
import { assertIdentifierFree } from '@/core/services/members/MemberService/rules'
import { SUMMARY_INCLUDE, toSummary } from '@/core/services/members/MemberService/shape'

/**
 * Turn parsed values into a database payload
 * @param {FormValues} values - Parsed body
 * @return {Prisma.AccountUncheckedCreateInput} - Database payload
 */

const toAccountData = (values: FormValues) => ({
  displayName: readText(values, 'displayName') ?? '',
  discordId: (readText(values, 'discordId') ?? '').replace(/\D/g, ''),
  role: (readText(values, 'role') ?? 'MODERATEUR') as MemberRoleName,
  status: (readText(values, 'status') ?? MemberStatuses.Academy) as MemberStatusName,
  divisionId: readText(values, 'divisionId'),
  timezone: readText(values, 'timezone'),
  birthday: readDate(values, 'birthday'),
  leftAt: readDate(values, 'leftAt'),
  languages: readList(values, 'languages'),
  celebrateBirthday: readFlag(values, 'celebrateBirthday'),
})

/**
 * Seat a responsable in the last division when none is chosen
 * @param {ReturnType<typeof toAccountData>} data - Database payload
 * @return {Promise<ReturnType<typeof toAccountData>>} - Payload with its division
 */

const withLeadDivision = async (data: ReturnType<typeof toAccountData>) => {
  if (data.role !== MemberRoles.Responsable || data.divisionId) return data

  const division = (await allDivisions()).find((entry) => entry.rank === LEAD_DIVISION_RANK)

  return { ...data, divisionId: division?.id ?? null }
}

/**
 * Read the functions a member should hold
 * @param {FormValues} values - Parsed body
 * @return {Promise<string[]>} - Function identifiers to hold
 */

const readHeldFunctionIds = async (values: FormValues): Promise<string[]> => {
  const [primaries, secondaries] = await Promise.all([
    readKindIds(readList(values, 'primaryFunctionIds'), FunctionKinds.Primary),
    readKindIds(readList(values, 'secondaryFunctionIds'), FunctionKinds.Secondary),
  ])

  return [...primaries, ...secondaries]
}

/**
 * Names of the functions behind some identifiers
 * @param {string[]} functionIds - Function identifiers
 * @return {Promise<Set<string>>} - Names
 */

const heldNames = async (functionIds: string[]): Promise<Set<string>> => {
  const rows = await prisma.jobFunction.findMany({
    where: { id: { in: functionIds } },
    select: { name: true },
  })

  return new Set(rows.map((row) => row.name))
}

/**
 * Keep the ids that name an active function of one kind
 * @param {string[]} ids - Submitted identifiers
 * @param {FunctionKindName} kind - Principal or secondary
 * @return {Promise<string[]>} - Known identifiers
 */

const readKindIds = async (ids: string[], kind: FunctionKindName): Promise<string[]> => {
  if (ids.length === 0) return []

  const rows = await prisma.jobFunction.findMany({
    where: { id: { in: ids }, kind, archived: false },
    select: { id: true },
  })

  return rows.map((row) => row.id)
}

/**
 * Add a moderator
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberSummary>} - Created row
 */

export const createMember = async (values: FormValues): Promise<MemberSummary> => {
  const data = await withLeadDivision(toAccountData(values))
  const joinedAt = readDate(values, 'joinedAt')
  const youtuberIds = readList(values, 'youtuberIds')
  const functionIds = await readHeldFunctionIds(values)

  await assertIdentifierFree(data.discordId)

  const row = await prisma.account.create({
    data: {
      ...data,
      joinedAt: joinedAt ?? new Date(),
      youtubers: { connect: youtuberIds.map((id) => ({ id })) },
      functions: { create: functionIds.map((functionId) => ({ functionId })) },
    },
    include: SUMMARY_INCLUDE,
  })
  await syncTemporarySeats(row.id, await heldNames(functionIds), values)
  await syncFunctionTeams([row.id])

  // A brand new account never carries a note or a running absence yet
  return toSummary(row, { notesCount: 0, isAbsent: false })
}

/**
 * Edit a moderator
 * @param {string} id - Account identifier
 * @param {FormValues} values - Parsed body
 * @param {boolean} [byRoot] - The root administrator edits
 * @return {Promise<MemberSummary>} - Updated row
 */

export const updateMember = async (
  id: string,
  values: FormValues,
  byRoot = false
): Promise<MemberSummary> => {
  const current = await prisma.account.findUnique({ where: { id } })
  if (!current) throw notFound()

  // The root administrator is edited by nobody but itself, and keeps its identifier and its level
  const isRootTarget = isRootIdentity(current.discordId)
  if (isRootTarget && !byRoot) throw immutable(MEMBER_COPY.rootLocked)

  const kept = isRootTarget ? { discordId: current.discordId, role: current.role } : {}
  const data = {
    ...(await withoutSealedWrites(await withLeadDivision(toAccountData(values)))),
    ...kept,
  }
  if (data.discordId && data.discordId !== current.discordId) {
    await assertIdentifierFree(data.discordId, id)
  }

  const joinedAt = readDate(values, 'joinedAt')
  const youtuberIds = readList(values, 'youtuberIds')
  const functionIds = await readHeldFunctionIds(values)

  const row = await prisma.account.update({
    where: { id },
    data: {
      ...data,
      joinedAt: joinedAt ?? current.joinedAt,
      youtubers: { set: youtuberIds.map((youtuberId) => ({ id: youtuberId })) },
      // The whole set is sent every time
      functions: {
        deleteMany: {},
        create: functionIds.map((functionId) => ({ functionId })),
      },
    },
    include: {
      ...SUMMARY_INCLUDE,
      _count: { select: { notesReceived: true, absences: { where: activeAbsenceFilter() } } },
    },
  })
  await syncTemporarySeats(id, await heldNames(functionIds), values)
  await syncFunctionTeams([id])

  return toSummary(row, { notesCount: row._count.notesReceived, isAbsent: row._count.absences > 0 })
}

/**
 * Drop the details a member volunteered
 * @param {string} id - Account identifier
 * @return {Promise<void>} - Cleared
 */

export const clearVolunteeredDetails = async (id: string): Promise<void> => {
  await prisma.$transaction([
    prisma.socialLink.deleteMany({ where: { accountId: id } }),
    prisma.accountConstraint.deleteMany({ where: { accountId: id } }),
    prisma.account.update({
      where: { id },
      data: { birthday: null, celebrateBirthday: false },
    }),
  ])
}

/**
 * Erase a member and every trace holding their identifier
 * @param {string} id - Account identifier
 * @return {Promise<void>} - Deleted
 */

export const deleteMember = async (id: string): Promise<void> => {
  const current = await prisma.account.findUnique({ where: { id } })
  if (!current) throw notFound()
  if (isRootIdentity(current.discordId)) throw immutable(MEMBER_COPY.rootLocked)

  const filePrefix = fileUrl('')
  const avatarId = current.avatarUrl?.startsWith(filePrefix)
    ? current.avatarUrl.slice(filePrefix.length)
    : null

  // Owned rows follow through the foreign keys, loose references go by hand
  await prisma.$transaction([
    prisma.activityLog.deleteMany({
      where: { OR: [{ subjectId: id }, { targetType: 'member', targetId: id }] },
    }),
    prisma.notification.deleteMany({ where: { targetType: 'member', targetId: id } }),
    prisma.integrationClaim.deleteMany({ where: { discordId: current.discordId } }),
    ...(avatarId ? [prisma.storageEntry.deleteMany({ where: { id: avatarId } })] : []),
    prisma.account.delete({ where: { id } }),
  ])
}
