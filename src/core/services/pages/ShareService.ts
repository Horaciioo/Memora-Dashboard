import 'server-only'

import type { PageAccessLevel } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { canHandOut, shareTargetKey } from '@/core/lib/pages'
import type { PageViewer } from '@/core/lib/pages'
import { requirePage } from '@/core/services/pages/AccessService'
import { journalPage } from '@/core/services/pages/journal'
import { signalAccess } from '@/core/services/pages/signal'
import { toCrumb } from '@/core/services/pages/lookups'
import type { ChainRow } from '@/core/services/pages/lookups'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { GRANTABLE_LEVELS, PageShareScopes } from '@/declarations/pages/access'
import type { GrantableLevelName, PageShareScopeName } from '@/declarations/pages/access'
import { PAGE_DOCUMENT_COPY, PAGE_SHARE_COPY } from '@/declarations/pages/copy'
import type { PageCrumb, PageShare, PageSharing } from '@/types/pages'
import type { MemberRoleName } from '@/utils/constants/hierarchy'

const SHARE_SELECT = {
  id: true,
  pageId: true,
  scope: true,
  accountId: true,
  role: true,
  level: true,
  account: { select: { displayName: true, avatarUrl: true } },
} as const

/**
 * Display name of an audience
 * @param {Object} grant - Share
 * @param {PageShareScopeName} grant.scope - Audience kind
 * @param {MemberRoleName | null} grant.role - Level reached
 * @param {{ displayName: string } | null} grant.account - Account reached
 * @return {string} - Label
 */

export const shareLabel = (grant: {
  scope: PageShareScopeName
  role: MemberRoleName | null
  account: { displayName: string } | null
}): string => {
  if (grant.scope === PageShareScopes.Workspace) return PAGE_SHARE_COPY.workspace
  if (grant.scope === PageShareScopes.Role && grant.role) {
    return PAGE_SHARE_COPY.role.replace('{role}', ROLE_REGISTRY.get(grant.role).plural)
  }

  return grant.account?.displayName ?? ''
}

/**
 * Pages whose shares reach this one
 * @param {ChainRow[]} chain - Page then ancestors
 * @return {ChainRow[]} - Inheriting ancestors
 */

const inheritedFrom = (chain: ChainRow[]): ChainRow[] => {
  const sources: ChainRow[] = []

  for (const [index, row] of chain.entries()) {
    if (!row.inheritAccess) break
    const parent = chain[index + 1]
    if (parent) sources.push(parent)
  }

  return sources
}

/**
 * Who reaches a page, and through which page
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member asking
 * @return {Promise<PageSharing>} - Sharing state
 */

export const readSharing = async (pageId: unknown, viewer: PageViewer): Promise<PageSharing> => {
  const { page, chain, level } = await requirePage(pageId, viewer, 'read')
  const sources = inheritedFrom(chain)

  const [owner, grants] = await Promise.all([
    prisma.page.findUniqueOrThrow({
      where: { id: page.id },
      select: { owner: { select: { id: true, displayName: true, avatarUrl: true } } },
    }),
    prisma.pageGrant.findMany({
      where: { pageId: { in: [page.id, ...sources.map((row) => row.id)] } },
      select: SHARE_SELECT,
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const crumbs = new Map<string, PageCrumb>(sources.map((row) => [row.id, toCrumb(row)]))

  return {
    owner: { id: owner.owner.id, name: owner.owner.displayName, image: owner.owner.avatarUrl },
    shares: grants.map<PageShare>((grant) => ({
      id: grant.id,
      scope: grant.scope,
      level: grant.level,
      accountId: grant.accountId,
      role: grant.role,
      name: shareLabel(grant),
      image: grant.account?.avatarUrl ?? null,
      fromPage: crumbs.get(grant.pageId) ?? null,
    })),
    inheritAccess: page.inheritAccess,
    parent: chain[1] ? toCrumb(chain[1]) : null,
    level,
  }
}

/**
 * Check the audience of a share
 * @param {Record<string, unknown>} raw - Raw share
 * @param {string} ownerId - Page owner
 * @return {Promise<{ scope: PageShareScopeName, accountId: string | null, role: MemberRoleName | null }>} - Audience
 */

const readTarget = async (
  raw: Record<string, unknown>,
  ownerId: string
): Promise<{ scope: PageShareScopeName; accountId: string | null; role: MemberRoleName | null }> => {
  const refuse = () => invalidInput([{ field: 'scope', message: PAGE_DOCUMENT_COPY.shareTarget }])

  if (raw.scope === PageShareScopes.Workspace) return { scope: raw.scope, accountId: null, role: null }
  if (raw.scope === PageShareScopes.Role) {
    if (typeof raw.role !== 'string' || !ROLE_REGISTRY.has(raw.role)) throw refuse()

    return { scope: raw.scope, accountId: null, role: raw.role as MemberRoleName }
  }
  if (raw.scope !== PageShareScopes.Account || typeof raw.accountId !== 'string') throw refuse()
  if (raw.accountId === ownerId) throw invalidInput([{ field: 'accountId', message: PAGE_DOCUMENT_COPY.shareSelf }])

  // Only a current member
  const account = await prisma.account.findFirst({
    where: { id: raw.accountId, leftAt: null, anonymisedAt: null },
    select: { id: true },
  })
  if (!account) throw refuse()

  return { scope: raw.scope, accountId: account.id, role: null }
}

/**
 * Give or change one share
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member sharing
 * @param {Record<string, unknown>} raw - Audience and level
 * @return {Promise<PageSharing>} - Sharing state
 */

export const upsertShare = async (
  pageId: unknown,
  viewer: PageViewer,
  raw: Record<string, unknown>
): Promise<PageSharing> => {
  const { page, level: sharer } = await requirePage(pageId, viewer, 'share')
  const owner = await prisma.page.findUniqueOrThrow({ where: { id: page.id }, select: { ownerId: true } })
  const target = await readTarget(raw, owner.ownerId)

  const level = raw.level as GrantableLevelName
  if (!GRANTABLE_LEVELS.includes(level) || !canHandOut(sharer, level)) {
    throw invalidInput([{ field: 'level', message: PAGE_DOCUMENT_COPY.shareLevel }])
  }

  const targetKey = shareTargetKey(target)
  const previous = await prisma.pageGrant.findUnique({ where: { pageId_targetKey: { pageId: page.id, targetKey } } })

  await prisma.pageGrant.upsert({
    where: { pageId_targetKey: { pageId: page.id, targetKey } },
    create: { pageId: page.id, ...target, level: level as PageAccessLevel, targetKey, grantedById: viewer.id },
    update: { level: level as PageAccessLevel, grantedById: viewer.id },
  })

  await journalPage({
    eventType: 'PageShared',
    actorId: viewer.id,
    pageId: page.id,
    summary: page.title,
    payload: { target: targetKey, level, previous: previous?.level ?? null },
  })
  await signalAccess()

  return readSharing(page.id, viewer)
}

/**
 * Withdraw one share
 * @param {string} pageId - Page id
 * @param {string} shareId - Share id
 * @param {PageViewer} viewer - Member sharing
 * @return {Promise<PageSharing>} - Sharing state
 */

export const removeShare = async (pageId: unknown, shareId: string, viewer: PageViewer): Promise<PageSharing> => {
  const { page } = await requirePage(pageId, viewer, 'share')

  const grant = await prisma.pageGrant.findFirst({ where: { id: shareId, pageId: page.id } })
  if (!grant) throw notFound()

  await prisma.pageGrant.delete({ where: { id: grant.id } })
  await journalPage({
    eventType: 'PageUnshared',
    actorId: viewer.id,
    pageId: page.id,
    summary: page.title,
    payload: { target: grant.targetKey, level: grant.level },
  })
  await signalAccess()

  return readSharing(page.id, viewer)
}

/**
 * Shares a page holds once cut from its parent
 * @param {ChainRow[]} chain - Page then ancestors
 * @param {string} viewerId - Member cutting
 * @return {Promise<{ targetKey: string, scope: PageShareScopeName, accountId: string | null, role: MemberRoleName | null, level: GrantableLevelName }[]>} - Copied shares
 */

const sharesToKeep = async (chain: ChainRow[], viewerId: string) => {
  const sources = inheritedFrom(chain)
  const [page] = chain
  const owners = await prisma.page.findMany({ where: { id: { in: sources.map((row) => row.id) } }, select: { ownerId: true } })

  // Parent shares, ancestor owners and the cutter stay in
  const candidates = [
    ...sources.flatMap((row) => row.grants),
    ...[...owners.map((row) => row.ownerId), viewerId].map((accountId) => ({
      scope: PageShareScopes.Account,
      accountId,
      role: null,
      level: 'FULL' as GrantableLevelName,
    })),
  ].filter((grant) => grant.accountId !== page?.ownerId)

  const strongest = new Map<string, (typeof candidates)[number]>()
  for (const grant of candidates) {
    const key = shareTargetKey(grant)
    const kept = strongest.get(key)
    if (!kept || GRANTABLE_LEVELS.indexOf(grant.level) < GRANTABLE_LEVELS.indexOf(kept.level)) strongest.set(key, grant)
  }

  return [...strongest.entries()].map(([targetKey, grant]) => ({ targetKey, ...grant }))
}

/**
 * Take or cut the shares of the parent page
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member sharing
 * @param {boolean} inherit - Take the parent shares
 * @return {Promise<PageSharing>} - Sharing state
 */

export const setInheritance = async (pageId: unknown, viewer: PageViewer, inherit: boolean): Promise<PageSharing> => {
  const { page, chain } = await requirePage(pageId, viewer, 'share')
  if (!page.parentId || page.inheritAccess === inherit) return readSharing(page.id, viewer)

  // Cutting copies who had access, nobody drops out silently
  const kept = inherit ? [] : await sharesToKeep(chain, viewer.id)
  const own = new Set(page.grants.map((grant) => shareTargetKey(grant)))

  await prisma.$transaction([
    prisma.page.update({ where: { id: page.id }, data: { inheritAccess: inherit } }),
    prisma.pageGrant.createMany({
      data: kept
        .filter((grant) => !own.has(grant.targetKey))
        .map((grant) => ({ pageId: page.id, ...grant, level: grant.level as PageAccessLevel, grantedById: viewer.id })),
    }),
  ])

  await journalPage({
    eventType: 'PageInheritanceChanged',
    actorId: viewer.id,
    pageId: page.id,
    summary: page.title,
    payload: { inherit, copied: kept.map((grant) => grant.targetKey) },
  })
  await signalAccess()

  return readSharing(page.id, viewer)
}
