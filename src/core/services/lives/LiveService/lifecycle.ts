import 'server-only'
import { prisma } from '@/core/lib/db'
import { readAnchors } from '@/core/services/auth/LeadService'
import { closeLivePresences } from '@/core/services/lives/PresenceService'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { readList, readText } from '@/core/lib/forms/values'
import { syncJuniorLives } from '@/core/services/academy/parkour/LiveCountService'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { syncRoster } from '@/core/services/calendar/attendance'
import { notify } from '@/core/services/system/NotificationService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { publishLive } from '@/core/lib/lives/bus'
import type { CoordinationSeat } from '@/core/lib/lives/coordination'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_FIELD_COPY, LIVE_INSTRUCTIONS_DEFAULT } from '@/declarations/lives/copy'
import type { FormValues } from '@/types/forms'
import type { LiveView } from '@/types/lives'
import { CoordinationStatuses, LivePlatforms, LiveStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import type { PermissionName } from '@/utils/constants/permissions'
import { Permissions } from '@/utils/constants/permissions'
import type { LiveInput } from '@/core/services/lives/LiveService/forms'
import { convene } from '@/core/services/lives/LiveService/convene'
import { assertCoordinators } from '@/core/services/lives/LiveService/coordinators'
import { readLive } from '@/core/services/lives/LiveService/reads'

/**
 * Open the live behind a calendar entry: convene the team and ask the Coordinators
 * @param {Object} input - Entry and live fields
 * @param {{ id: string, title: string, startsAt: Date, endsAt: Date | null }} input.entry - Calendar entry
 * @param {LiveInput} input.live - Live fields
 * @param {string} input.actorId - Who posts it
 * @param {AccessScope} input.scope - Creator perimeter
 * @return {Promise<string>} - New live identifier
 */

export const openLive = async ({
  entry,
  live: input,
  actorId,
  scope,
}: {
  entry: { id: string; title: string; startsAt: Date; endsAt: Date | null }
  live: LiveInput
  actorId: string
  scope: AccessScope
}): Promise<string> => {
  // Planned end is the one typed, none is invented, closing the live stays manual
  const { endsAt } = entry

  const convened = await convene({
    youtuberId: input.youtuberId,
    picked: input.pickedIds,
    startsAt: entry.startsAt,
    endsAt: endsAt ?? entry.startsAt,
    scope,
  })
  const memberIds = [...new Set([...input.coordinatorIds, ...convened])]
  await syncRoster(entry.id, memberIds)

  const live = await prisma.live.create({
    data: {
      youtuberId: input.youtuberId,
      platform: input.platform,
      title: entry.title,
      plannedStartAt: entry.startsAt,
      plannedEndAt: endsAt,
      announcedById: actorId,
      calendarEventId: entry.id,
      instructions: input.instructions ?? LIVE_INSTRUCTIONS_DEFAULT,
      members: { create: memberIds.map((accountId) => ({ accountId })) },
      coordinations: { create: input.coordinatorIds.map((accountId) => ({ accountId })) },
    },
  })

  await publishLive(LIVE_TOPICS.lives, {
    liveId: live.id,
    youtuberId: input.youtuberId,
    status: LiveStatuses.Announced,
  })

  // Coordinators are asked, never assigned
  await notify({
    kind: 'LiveCoordinatorAsked',
    recipients: input.coordinatorIds,
    actorId,
    target: 'home',
    subject: entry.title,
  })

  await notify({
    kind: 'LiveAnnounced',
    recipients: memberIds.filter((id) => !input.coordinatorIds.includes(id)),
    actorId,
    target: 'live',
    targetId: live.id,
    subject: entry.title,
  })

  await recordEvent({
    eventType: 'LiveAnnounced',
    actorId,
    targetType: 'live',
    targetId: live.id,
    summary: entry.title,
  })

  return live.id
}

/**
 * Keep an announced live in step with its calendar entry
 * @param {string} entryId - Calendar entry
 * @param {FormValues} [values] - Form values when the entry was edited by hand
 * @param {string} [actorId] - Who edited it
 * @return {Promise<void>} - Live updated
 */

export const syncLiveWithEntry = async (
  entryId: string,
  values?: FormValues,
  actorId?: string
): Promise<void> => {
  const live = await prisma.live.findUnique({
    where: { calendarEventId: entryId },
    include: { coordinations: { select: { accountId: true } } },
  })
  // A live under way or closed keeps its own record
  if (!live || live.status !== LiveStatuses.Announced) return

  const entry = await prisma.calendarEvent.findUnique({ where: { id: entryId } })
  if (!entry) return

  const picked = values ? readText(values, 'platform') : null
  const known = new Set(live.coordinations.map((seat) => seat.accountId))
  const added = values ? readList(values, 'coordinatorIds').filter((id) => !known.has(id)) : []
  await assertCoordinators(live.youtuberId, added)

  await prisma.live.update({
    where: { id: live.id },
    data: {
      title: entry.title,
      plannedStartAt: entry.startsAt,
      plannedEndAt: entry.endsAt,
      ...(entry.youtuberId && { youtuberId: entry.youtuberId }),
      ...((picked === LivePlatforms.Twitch || picked === LivePlatforms.YouTube) && {
        platform: picked,
      }),
      ...(values &&
        readText(values, 'instructions') && {
          instructions: readText(values, 'instructions') ?? live.instructions,
        }),
      coordinations: { create: added.map((accountId) => ({ accountId })) },
    },
  })

  if (added.length > 0) {
    await notify({
      kind: 'LiveCoordinatorAsked',
      recipients: added,
      actorId,
      target: 'home',
      subject: entry.title,
    })
  }

  await publishLive(LIVE_TOPICS.lives, {
    liveId: live.id,
    youtuberId: live.youtuberId,
    status: LiveStatuses.Announced,
  })
}

/**
 * Call off the announced lives behind calendar entries about to be dropped
 * @param {string[]} entryIds - Calendar entries
 * @return {Promise<void>} - Lives cancelled
 */

export const cancelLivesOfEntries = async (entryIds: string[]): Promise<void> => {
  // A running live keeps its roll-call
  const running = await prisma.live.count({
    where: { calendarEventId: { in: entryIds }, status: LiveStatuses.Live },
  })
  if (running > 0) throw conflict(LIVE_FIELD_COPY.runningEntry)

  await prisma.live.updateMany({
    where: { calendarEventId: { in: entryIds }, status: LiveStatuses.Announced },
    data: { status: LiveStatuses.Cancelled },
  })
}

/**
 * Give the calendar entry back the planned end the closing replaced
 * @param {string} id - Live identifier
 * @return {Promise<void>} - Restored
 */

const restorePlannedEnd = async (id: string): Promise<void> => {
  const row = await prisma.live.findUnique({
    where: { id },
    select: { calendarEventId: true, plannedEndAt: true },
  })
  if (!row?.calendarEventId || !row.plannedEndAt) return

  await prisma.calendarEvent.update({
    where: { id: row.calendarEventId },
    data: { endsAt: row.plannedEndAt },
  })
}

/**
 * Put back a live closed by mistake
 * @param {string} id - Live identifier
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @param {AccessScope} scope - Actor's perimeter
 * @return {Promise<LiveView>} - Live running again
 */

export const reopenLive = async (
  id: string,
  viewerId: string,
  held: PermissionName[],
  scope: AccessScope
): Promise<LiveView> => {
  const live = await readLive(id, scope, viewerId, held)
  if (!live.canReopen) throw forbidden()

  // Only an ended live reopens
  const reopened = await prisma.live.updateMany({
    where: { id, status: LiveStatuses.Ended },
    data: { status: LiveStatuses.Live, endedAt: null },
  })
  if (reopened.count === 0) throw conflict()
  await restorePlannedEnd(id)
  await syncJuniorLives(live.members.map((member) => member.id))
  await publishLive(LIVE_TOPICS.lives, {
    liveId: id,
    youtuberId: live.youtuber.id,
    status: LiveStatuses.Live,
  })

  return readLive(id, scope, viewerId, held)
}

// Calendar follows the real end
const syncEntryWithStatus = async (
  entryId: string | null,
  next: LiveStatusName,
  now: Date
): Promise<void> => {
  if (!entryId) return

  // Cancelled: no roll-call left
  if (next === LiveStatuses.Cancelled) {
    await prisma.calendarEvent.update({
      where: { id: entryId },
      data: { rollCall: false, remindAt: null },
    })
  }
  if (next === LiveStatuses.Ended) {
    await prisma.calendarEvent.updateMany({
      where: { id: entryId, startsAt: { lt: now } },
      data: { endsAt: now },
    })
  }
}

/**
 * Move a live to its next status
 * @param {Object} live - Live row
 * @param {LiveStatusName} next - Next status
 * @param {string | null} actorId - Who moves it
 * @param {string} [streamExternalId] - Platform stream
 * @return {Promise<void>} - Moved
 */

const applyLiveStatus = async (
  live: {
    id: string
    youtuberId: string
    title: string
    calendarEventId: string | null
    status: LiveStatusName
    coordinations: CoordinationSeat[]
    members: { accountId: string }[]
  },
  next: LiveStatusName,
  actorId: string | null,
  streamExternalId?: string
): Promise<void> => {
  // Allowed moves only
  const allowed: Record<LiveStatusName, LiveStatusName[]> = {
    [LiveStatuses.Announced]: [LiveStatuses.Live, LiveStatuses.Cancelled],
    [LiveStatuses.Live]: [LiveStatuses.Ended],
    [LiveStatuses.Ended]: [],
    [LiveStatuses.Cancelled]: [],
  }
  if (!allowed[live.status].includes(next)) throw conflict()

  // Only from the status read
  const now = new Date()
  const moved = await prisma.live.updateMany({
    where: { id: live.id, status: live.status },
    data: {
      status: next,
      startedAt: next === LiveStatuses.Live ? now : undefined,
      endedAt: next === LiveStatuses.Ended || next === LiveStatuses.Cancelled ? now : undefined,
      ...(streamExternalId ? { streamExternalId } : {}),
    },
  })
  if (moved.count === 0) throw conflict()
  await syncEntryWithStatus(live.calendarEventId, next, now)

  await publishLive(LIVE_TOPICS.lives, {
    liveId: live.id,
    youtuberId: live.youtuberId,
    status: next,
  })

  // The end closes every Mod View presence
  if (next === LiveStatuses.Ended) {
    await closeLivePresences(live.id).catch(() => null)

    // The creator's responsables and the coordinator get the report
    const anchors = await readAnchors(live.youtuberId)
    await notify({
      kind: 'LiveReportReady',
      recipients: [
        ...anchors.map((anchor) => anchor.accountId),
        ...live.coordinations
          .filter((seat) => seat.status === CoordinationStatuses.Accepted)
          .map((seat) => seat.accountId),
      ],
      actorId,
      target: 'liveReport',
      targetId: live.id,
      subject: live.title,
    })
  }

  // A closed live moves the PIM count of the juniors present
  const recipients = live.members.map((seat) => seat.accountId)
  if (next === LiveStatuses.Ended || next === LiveStatuses.Cancelled) {
    await syncJuniorLives(recipients)
  }

  // Team told of the start or the cancel
  if (next === LiveStatuses.Live) {
    await notify({
      kind: 'LiveStarted',
      recipients,
      actorId,
      target: 'live',
      targetId: live.id,
      subject: live.title,
    })
  }
  if (next === LiveStatuses.Cancelled) {
    await notify({
      kind: 'LiveCancelled',
      recipients,
      actorId,
      target: 'live',
      targetId: live.id,
      subject: live.title,
    })
  }
}

/**
 * Move a live within the actor's perimeter
 * @param {string} id - Live identifier
 * @param {LiveStatusName} next - Next status
 * @param {string} actorId - Who moves it
 * @param {AccessScope} scope - Actor's perimeter
 * @return {Promise<void>} - Moved
 */

export const moveLive = async (
  id: string,
  next: LiveStatusName,
  actorId: string,
  scope: AccessScope
): Promise<void> => {
  const live = await prisma.live.findFirst({
    where: scopedWhere('live', scope, { id }),
    include: { members: { select: { accountId: true } }, coordinations: true },
  })
  if (!live) throw notFound()

  await applyLiveStatus(live, next, actorId)
}

/**
 * Move a live because the platform said so: online starts it
 * @param {string} id - Live identifier
 * @param {LiveStatusName} next - Next status
 * @param {string} [streamExternalId] - Platform stream
 * @return {Promise<boolean>} - Moved
 */

export const moveLiveFromPlatform = async (
  id: string,
  next: LiveStatusName,
  streamExternalId?: string
): Promise<boolean> => {
  const live = await prisma.live.findUnique({
    where: { id },
    include: { members: { select: { accountId: true } }, coordinations: true },
  })
  if (!live || live.status === next) return false

  try {
    await applyLiveStatus(live, next, null, streamExternalId)

    return true
  } catch {
    // A live closed by hand meanwhile stays closed
    return false
  }
}

/**
 * Rewrite the instructions of a live
 * @param {Object} input - Edit
 * @param {string} input.id - Live identifier
 * @param {string} input.instructions - Markdown
 * @param {AccessScope} input.scope - Editor perimeter
 * @param {string} input.viewerId - Editor
 * @param {PermissionName[]} input.held - Permissions held
 * @return {Promise<LiveView>} - Live after the edit
 */

export const saveInstructions = async ({
  id,
  instructions,
  scope,
  viewerId,
  held,
}: {
  id: string
  instructions: string
  scope: AccessScope
  viewerId: string
  held: PermissionName[]
}): Promise<LiveView> => {
  const live = await readLive(id, scope, viewerId, held)
  if (!held.includes(Permissions.LiveAnnounce) && !live.isCoordinating) throw forbidden()

  await prisma.live.update({
    where: { id },
    data: { instructions: instructions.slice(0, FORM_SETTINGS.markdownMaxLength) },
  })

  return readLive(id, scope, viewerId, held)
}

/**
 * Erase a finished live with everything tied to it: gestures, presences, samples, level changes and its calendar entry
 * @param {string} id - Live
 * @return {Promise<void>}
 */

export const deleteLive = async (id: string): Promise<void> => {
  const live = await prisma.live.findUnique({
    where: { id },
    select: { status: true, calendarEventId: true },
  })
  if (!live) throw notFound()
  // Only a closed live is erased
  if (live.status !== LiveStatuses.Ended && live.status !== LiveStatuses.Cancelled) {
    throw conflict()
  }

  await prisma.$transaction([
    prisma.liveconEntry.deleteMany({ where: { liveId: id } }),
    prisma.live.delete({ where: { id } }),
    ...(live.calendarEventId
      ? [prisma.calendarEvent.deleteMany({ where: { id: live.calendarEventId } })]
      : []),
  ])
}
