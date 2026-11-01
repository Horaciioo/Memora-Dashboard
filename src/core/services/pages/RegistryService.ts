import 'server-only'

import { prisma } from '@/core/lib/db'
import { shareLabel } from '@/core/services/pages/ShareService'
import type { PageRegistryRow } from '@/types/pages'

/**
 * Every page of Memora for the system console, never the content
 * @return {Promise<PageRegistryRow[]>} - Registry rows
 */

export const listPageRegistry = async (): Promise<PageRegistryRow[]> => {
  const rows = await prisma.page.findMany({
    // Content and search text never leave
    select: {
      id: true,
      title: true,
      icon: true,
      inheritAccess: true,
      createdAt: true,
      contentAt: true,
      trashedAt: true,
      owner: { select: { displayName: true, avatarUrl: true } },
      parent: { select: { title: true } },
      grants: {
        select: { scope: true, role: true, level: true, account: { select: { displayName: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    icon: row.icon,
    ownerName: row.owner.displayName,
    ownerImage: row.owner.avatarUrl,
    parentTitle: row.parent?.title ?? null,
    inheritAccess: row.inheritAccess,
    shares: row.grants.map((grant) => ({ label: shareLabel(grant), level: grant.level })),
    createdAt: row.createdAt.toISOString(),
    contentAt: row.contentAt.toISOString(),
    trashedAt: row.trashedAt?.toISOString() ?? null,
  }))
}
