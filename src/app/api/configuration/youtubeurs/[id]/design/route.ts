import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  assignBannerSlot,
  dropDesignImage,
  putDesignImage,
  readDesign,
} from '@/core/services/reference/CreatorDesignService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { BannerSlots, DESIGN_COPY, DesignKinds } from '@/declarations/reference/design'
import type { BannerSlotName, DesignKindName } from '@/declarations/reference/design'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read the submitted picture kind
 * @param {unknown} value - Raw kind
 * @return {DesignKindName} - Known kind
 */

const readKind = (value: unknown): DesignKindName => {
  const kind = Object.values(DesignKinds).find((known) => known === value)
  if (!kind) throw invalidInput([{ field: 'kind', message: DESIGN_COPY.unknownKind }])

  return kind
}

/**
 * Read the submitted banner place
 * @param {unknown} value - Raw place
 * @return {BannerSlotName | null} - Known place or none
 */

const readSlot = (value: unknown): BannerSlotName | null => {
  if (value === null) return null
  const slot = Object.values(BannerSlots).find((known) => known === value)
  if (!slot) throw invalidInput([{ field: 'slot', message: DESIGN_COPY.unknownSlot }])

  return slot
}

export const GET = createProtectedRoute({
  permission: Permissions.ReferenceRead,
  descriptor: { summary: 'Read the pictures of a creator', tags: ['reference'] },
  handler: ({ params }) => readDesign(params.id),
})

export const POST = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Add or replace a picture of a creator', tags: ['reference'] },
  handler: async ({ params, raw, session, access }) => {
    if (!access.isAdmin) throw forbidden()

    const kind = readKind(raw.kind)
    const url = typeof raw.url === 'string' ? raw.url : ''
    if (!url.startsWith('/api/fichiers/')) throw invalidInput([{ field: 'url', message: '' }])

    const design = await putDesignImage(
      params.id,
      kind,
      url,
      typeof raw.id === 'string' ? raw.id : undefined
    )

    await recordEvent({
      eventType: 'ReferenceChanged',
      actorId: session.id,
      targetType: 'youtuber',
      targetId: params.id,
      summary: kind,
    })

    return design
  },
})

export const PATCH = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Give a banner of a creator its place', tags: ['reference'] },
  handler: async ({ params, raw, session, access }) => {
    if (!access.isAdmin) throw forbidden()

    if (typeof raw.id !== 'string') throw invalidInput([{ field: 'id', message: '' }])
    const design = await assignBannerSlot(params.id, raw.id, readSlot(raw.slot))

    await recordEvent({
      eventType: 'ReferenceChanged',
      actorId: session.id,
      targetType: 'youtuber',
      targetId: params.id,
      summary: DESIGN_COPY.assigned,
    })

    return design
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Remove a picture of a creator', tags: ['reference'] },
  handler: async ({ params, raw, session, access }) => {
    if (!access.isAdmin) throw forbidden()

    const kind = readKind(raw.kind)
    const design = await dropDesignImage(
      params.id,
      kind,
      typeof raw.id === 'string' ? raw.id : undefined
    )

    await recordEvent({
      eventType: 'ReferenceChanged',
      actorId: session.id,
      targetType: 'youtuber',
      targetId: params.id,
      summary: DESIGN_COPY.removed,
    })

    return design
  },
})
