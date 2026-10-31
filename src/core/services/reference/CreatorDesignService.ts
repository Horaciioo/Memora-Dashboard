import 'server-only'

import { prisma } from '@/core/lib/db'
import { BannerSlots, DesignKinds } from '@/declarations/reference/design'
import type { BannerSlotName, DesignKindName } from '@/declarations/reference/design'
import type { CreatorDesign } from '@/types/design'

/**
 * Read the pictures of one creator
 * @param {string} youtuberId - Creator identifier
 * @return {Promise<CreatorDesign>} - Banners, avatar and logo
 */

export const readDesign = async (youtuberId: string): Promise<CreatorDesign> => {
  const row = await prisma.youtuber.findUnique({
    where: { id: youtuberId },
    select: {
      avatarUrl: true,
      logoUrl: true,
      banners: { select: { id: true, url: true, slot: true }, orderBy: { position: 'asc' } },
    },
  })

  return {
    banners: (row?.banners ?? []).map((banner) => ({
      ...banner,
      slot: Object.values(BannerSlots).find((known) => known === banner.slot) ?? null,
    })),
    avatarUrl: row?.avatarUrl ?? null,
    logoUrl: row?.logoUrl ?? null,
  }
}

/**
 * Keep denormalised banners on their places
 * @param {string} youtuberId - Creator identifier
 * @return {Promise<void>} - Synced
 */

const syncLeadBanner = async (youtuberId: string): Promise<void> => {
  const placed = await prisma.youtuberBanner.findMany({
    where: { youtuberId, slot: { in: [BannerSlots.Main, BannerSlots.Fade] } },
    select: { url: true, slot: true },
  })
  const first = await prisma.youtuberBanner.findFirst({
    where: { youtuberId },
    orderBy: { position: 'asc' },
    select: { url: true },
  })
  const urlOf = (slot: BannerSlotName) => placed.find((banner) => banner.slot === slot)?.url

  await prisma.youtuber.update({
    where: { id: youtuberId },
    data: {
      bannerUrl: urlOf(BannerSlots.Main) ?? first?.url ?? null,
      fadeBannerUrl: urlOf(BannerSlots.Fade) ?? null,
    },
  })
}

/**
 * Put a picture in place: a banner joins the bank or replaces one, avatar and logo are swapped
 * @param {string} youtuberId - Creator identifier
 * @param {DesignKindName} kind - Picture kind
 * @param {string} url - Stored picture route
 * @param {string} [bannerId] - Banner being replaced
 * @return {Promise<CreatorDesign>} - Pictures after the change
 */

export const putDesignImage = async (
  youtuberId: string,
  kind: DesignKindName,
  url: string,
  bannerId?: string
): Promise<CreatorDesign> => {
  if (kind === DesignKinds.Avatar) {
    await prisma.youtuber.update({ where: { id: youtuberId }, data: { avatarUrl: url } })
  } else if (kind === DesignKinds.Logo) {
    await prisma.youtuber.update({ where: { id: youtuberId }, data: { logoUrl: url } })
  } else if (bannerId) {
    await prisma.youtuberBanner.updateMany({ where: { id: bannerId, youtuberId }, data: { url } })
    await syncLeadBanner(youtuberId)
  } else {
    const last = await prisma.youtuberBanner.aggregate({
      where: { youtuberId },
      _max: { position: true },
    })
    await prisma.youtuberBanner.create({
      data: { youtuberId, url, position: (last._max.position ?? -1) + 1 },
    })
    await syncLeadBanner(youtuberId)
  }

  return readDesign(youtuberId)
}

/**
 * Take a picture away
 * @param {string} youtuberId - Creator identifier
 * @param {DesignKindName} kind - Picture kind
 * @param {string} [bannerId] - Banner to drop
 * @return {Promise<CreatorDesign>} - Pictures after the change
 */

export const dropDesignImage = async (
  youtuberId: string,
  kind: DesignKindName,
  bannerId?: string
): Promise<CreatorDesign> => {
  if (kind === DesignKinds.Avatar) {
    await prisma.youtuber.update({ where: { id: youtuberId }, data: { avatarUrl: null } })
  } else if (kind === DesignKinds.Logo) {
    await prisma.youtuber.update({ where: { id: youtuberId }, data: { logoUrl: null } })
  } else {
    await prisma.youtuberBanner.deleteMany({ where: { id: bannerId ?? '', youtuberId } })
    await syncLeadBanner(youtuberId)
  }

  return readDesign(youtuberId)
}

/**
 * Give a banner a place, or free it
 * @param {string} youtuberId - Creator identifier
 * @param {string} bannerId - Banner to move
 * @param {BannerSlotName | null} slot - New place
 * @return {Promise<CreatorDesign>} - Pictures after the change
 */

export const assignBannerSlot = async (
  youtuberId: string,
  bannerId: string,
  slot: BannerSlotName | null
): Promise<CreatorDesign> => {
  // One banner per place
  if (slot) {
    await prisma.youtuberBanner.updateMany({
      where: { youtuberId, slot },
      data: { slot: null },
    })
  }
  await prisma.youtuberBanner.updateMany({ where: { id: bannerId, youtuberId }, data: { slot } })
  await syncLeadBanner(youtuberId)

  return readDesign(youtuberId)
}
