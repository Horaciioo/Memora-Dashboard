import 'server-only'

import { prisma } from '@/core/lib/db'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { MINUTE_MS } from '@/utils/constants/time'

/**
 * Keep a snapshot once the last one is old enough
 * @param {string} pageId - Page id
 * @param {string} authorId - Member who saved
 * @return {Promise<void>} - Kept or skipped
 */

export const snapshotRevision = async (pageId: string, authorId: string): Promise<void> => {
  const last = await prisma.pageRevision.findFirst({
    where: { pageId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })
  if (last && Date.now() - last.createdAt.getTime() < PAGE_SETTINGS.revisionEveryMinutes * MINUTE_MS) return

  const page = await prisma.page.findUniqueOrThrow({
    where: { id: pageId },
    select: { version: true, title: true, content: true },
  })

  await prisma.pageRevision.create({
    data: { pageId, version: page.version, title: page.title, content: page.content ?? {}, authorId },
  })

  // Oldest snapshots fall off
  const stale = await prisma.pageRevision.findMany({
    where: { pageId },
    orderBy: { createdAt: 'desc' },
    skip: PAGE_SETTINGS.revisionsKept,
    select: { id: true },
  })
  if (stale.length > 0) await prisma.pageRevision.deleteMany({ where: { id: { in: stale.map((row) => row.id) } } })
}
