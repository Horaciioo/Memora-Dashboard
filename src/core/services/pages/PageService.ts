import 'server-only'

import crypto from 'crypto'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput } from '@/core/lib/errors'
import { API_ROUTES } from '@/core/lib/api/routes'
import { emptyDocument, mediaIdOf, validateDocument } from '@/core/lib/pages/document'
import { toBase64 } from '@/core/lib/realtime/codec'
import { canOwnPages, reachesOthers } from '@/core/lib/pages'
import type { PageViewer } from '@/core/lib/pages'
import { requireCategory } from '@/core/services/pages/CategoryService'
import { reachablePageIds, requirePage } from '@/core/services/pages/AccessService'
import { journalPage } from '@/core/services/pages/journal'
import {
  SUMMARY_SELECT,
  nextPosition,
  toAccessNode,
  toCrumb,
  toSummary,
} from '@/core/services/pages/lookups'
import { pageSharedState } from '@/core/services/pages/PageDocService'
import { signalPage } from '@/core/services/pages/signal'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { PAGE_DOCUMENT_COPY } from '@/declarations/pages/copy'
import { PAGE_STREAM_EVENTS } from '@/declarations/pages/topics'
import { PAGE_TEMPLATES, templateDocument } from '@/declarations/pages/templates'
import type { PageTemplateName } from '@/declarations/pages/templates'
import type { PageDetail, PageDocument, PageSummary } from '@/types/pages'

/**
 * Every page a member may open, for the rail
 * @param {PageViewer} viewer - Member asking
 * @return {Promise<PageSummary[]>} - Reachable pages
 */

export const listPages = async (viewer: PageViewer): Promise<PageSummary[]> => {
  const ids = await reachablePageIds(viewer)
  if (ids.length === 0) return []

  const rows = await prisma.page.findMany({
    where: { id: { in: ids } },
    select: SUMMARY_SELECT,
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })

  return rows.map((row) => toSummary(row, viewer.id))
}

/**
 * Create a page, under a parent the member may write in
 * @param {PageViewer} viewer - Member creating
 * @param {Object} input - Page start
 * @param {unknown} [input.parentId] - Parent page
 * @param {unknown} [input.categoryId] - Category of a root page
 * @param {unknown} [input.template] - Template key
 * @return {Promise<PageSummary>} - New page
 */

export const createPage = async (
  viewer: PageViewer,
  input: { parentId?: unknown; categoryId?: unknown; template?: unknown }
): Promise<PageSummary> => {
  // Guests only add under a page they may write
  if (!input.parentId && !canOwnPages(viewer)) throw forbidden()

  // A sub page needs write access on its parent
  const parentId = input.parentId
    ? (await requirePage(input.parentId, viewer, 'write')).page.id
    : null

  // Only a root page sits in a category
  const categoryId =
    !parentId && input.categoryId ? (await requireCategory(input.categoryId, viewer)).id : null

  const template = typeof input.template === 'string' && input.template ? input.template : null
  if (template && !PAGE_TEMPLATES.has(template)) {
    throw invalidInput([{ field: 'template', message: PAGE_DOCUMENT_COPY.template }])
  }

  const preset = template ? PAGE_TEMPLATES.get(template as PageTemplateName) : null
  const check = validateDocument(
    preset ? templateDocument(template as PageTemplateName) : emptyDocument(),
    { isOwnMedia: () => false, newId: crypto.randomUUID }
  )
  if (!check.ok) throw invalidInput([], PAGE_DOCUMENT_COPY[check.issue])

  const row = await prisma.page.create({
    data: {
      ownerId: viewer.id,
      parentId,
      categoryId,
      title: preset?.title ?? '',
      icon: preset?.icon ?? null,
      content: check.document as unknown as Prisma.InputJsonValue,
      searchText: check.text,
      position: await nextPosition(parentId, viewer.id, categoryId),
      editedById: viewer.id,
    },
    select: SUMMARY_SELECT,
  })

  await journalPage({
    eventType: 'PageCreated',
    actorId: viewer.id,
    pageId: row.id,
    summary: row.title,
  })

  return toSummary(row, viewer.id)
}

/**
 * Open a page with its trail and children
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member reading
 * @return {Promise<PageDetail>} - Page
 */

export const readPage = async (pageId: unknown, viewer: PageViewer): Promise<PageDetail> => {
  const { page, chain, level, isTrashed } = await requirePage(pageId, viewer, 'read', {
    allowTrashed: true,
  })

  const row = await prisma.page.findUniqueOrThrow({
    where: { id: page.id },
    select: {
      ...SUMMARY_SELECT,
      content: true,
      version: true,
      coverMediaId: true,
      trashedAt: true,
      createdAt: true,
      contentAt: true,
      owner: { select: { displayName: true, avatarUrl: true } },
      editor: { select: { displayName: true } },
    },
  })

  // Children the member may open
  const reachable = new Set(await reachablePageIds(viewer))
  const children = await prisma.page.findMany({
    where: { parentId: page.id, trashedAt: null },
    select: SUMMARY_SELECT,
    orderBy: { position: 'asc' },
  })

  // Ancestors shown only while readable
  const trail = chain
    .slice(1)
    .filter((ancestor) => isTrashed || reachable.has(ancestor.id))
    .reverse()

  return {
    ...toSummary(row, viewer.id),
    ownerId: row.ownerId,
    ownerName: row.owner.displayName,
    ownerImage: row.owner.avatarUrl,
    coverUrl: row.coverMediaId ? API_ROUTES.pageMedia(row.coverMediaId) : null,
    content: row.content as unknown as PageDocument,
    version: row.version,
    level,
    inheritAccess: row.inheritAccess,
    trail: trail.map(toCrumb),
    children: children
      .filter((child) => reachable.has(child.id))
      .map((child) => toSummary(child, viewer.id)),
    trashedAt: row.trashedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    contentAt: row.contentAt.toISOString(),
    editorName: row.editor?.displayName ?? null,
    isCollaborative: reachesOthers(chain.map(toAccessNode)),
    yState: toBase64(await pageSharedState(page.id)),
  }
}

/**
 * Check an optional emoji
 * @param {unknown} value - Raw icon
 * @return {string | null} - Icon
 */

const readIcon = (value: unknown): string | null => {
  if (value === null || value === '') return null

  const icon = typeof value === 'string' ? value.trim() : ''
  // One grapheme, no letters
  const graphemes = [...new Intl.Segmenter().segment(icon)]
  if (graphemes.length !== 1 || /[\p{L}\p{N}<>]/u.test(icon)) {
    throw invalidInput([{ field: 'icon', message: PAGE_DOCUMENT_COPY.icon }])
  }

  return icon
}

/**
 * Change title, icon or cover
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member editing
 * @param {Record<string, unknown>} raw - Changed fields
 * @return {Promise<PageSummary>} - Page
 */

export const updatePageMeta = async (
  pageId: unknown,
  viewer: PageViewer,
  raw: Record<string, unknown>
): Promise<PageSummary> => {
  const { page } = await requirePage(pageId, viewer, 'write')
  const data: Prisma.PageUpdateInput = { editor: { connect: { id: viewer.id } } }

  if ('title' in raw) {
    const title = typeof raw.title === 'string' ? raw.title.replace(/\s+/g, ' ').trim() : ''
    if (title.length > PAGE_SETTINGS.titleMaxLength) {
      throw invalidInput([{ field: 'title', message: PAGE_DOCUMENT_COPY.title }])
    }
    data.title = title
  }

  if ('icon' in raw) data.icon = readIcon(raw.icon)

  // A cover is a picture of this page
  if ('coverUrl' in raw) data.coverMediaId = await readCover(page.id, raw.coverUrl)

  const row = await prisma.page.update({ where: { id: page.id }, data, select: SUMMARY_SELECT })
  await signalPage(page.id, PAGE_STREAM_EVENTS.meta)

  return toSummary(row, viewer.id)
}

/**
 * Check a cover address
 * @param {string} pageId - Page id
 * @param {unknown} value - Raw address
 * @return {Promise<string | null>} - Media id
 */

const readCover = async (pageId: string, value: unknown): Promise<string | null> => {
  if (value === null || value === '') return null

  const mediaId = typeof value === 'string' ? mediaIdOf(value) : null
  const media = mediaId
    ? await prisma.pageMedia.findFirst({ where: { id: mediaId, pageId } })
    : null
  if (!media) throw invalidInput([{ field: 'cover', message: PAGE_DOCUMENT_COPY.cover }])

  return media.id
}
