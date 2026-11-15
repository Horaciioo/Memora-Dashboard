import 'server-only'

import { prisma } from '@/core/lib/db'
import { creatorSlug } from '@/core/lib/unban/slug'
import type { IntegrationCreator } from '@/types/onboarding'

// What the public pages may learn about a creator
const PUBLIC_SELECT = {
  id: true,
  name: true,
  accent: true,
  avatarUrl: true,
  bannerUrl: true,
} as const

/**
 * Creator behind an address segment, none when no creator carries it
 * @param {string} slug - Segment from the address
 * @return {Promise<IntegrationCreator | null>} - Creator
 */

export const findContestCreator = async (slug: string): Promise<IntegrationCreator | null> => {
  const creators = await prisma.youtuber.findMany({ select: PUBLIC_SELECT })

  return creators.find((creator) => creatorSlug(creator.name) === slug) ?? null
}
