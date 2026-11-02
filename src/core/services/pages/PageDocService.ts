import 'server-only'

import crypto from 'crypto'

import type { Prisma } from '@prisma/client'
import { prosemirrorJSONToYDoc, yXmlFragmentToProsemirrorJSON } from '@tiptap/y-tiptap'
import * as Y from 'yjs'

import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { validateDocument } from '@/core/lib/pages/document'
import { PAGE_DOC_FIELD, PAGE_SCHEMA } from '@/core/lib/pages/schema'
import type { DocStore } from '@/core/lib/realtime/server/docs'
import { snapshotRevision } from '@/core/services/pages/RevisionService'
import { signalPage } from '@/core/services/pages/signal'
import { PAGE_STREAM_EVENTS } from '@/declarations/pages/topics'

/**
 * Shared state of a page, built once from its content
 * @param {string} pageId - Page id
 * @return {Promise<Uint8Array>} - Yjs state
 */

export const pageSharedState = async (pageId: string): Promise<Uint8Array> => {
  const row = await prisma.page.findUniqueOrThrow({
    where: { id: pageId },
    select: { yState: true, content: true },
  })
  if (row.yState) return row.yState

  // One history for everyone, the first writer wins
  const doc = prosemirrorJSONToYDoc(PAGE_SCHEMA, row.content, PAGE_DOC_FIELD)
  const state = new Uint8Array(Y.encodeStateAsUpdate(doc))
  doc.destroy()
  await prisma.page.updateMany({ where: { id: pageId, yState: null }, data: { yState: state } })
  const stored = await prisma.page.findUniqueOrThrow({
    where: { id: pageId },
    select: { yState: true },
  })

  return stored.yState ?? state
}

/**
 * Write a shared document back, content derived and checked
 * @param {string} pageId - Page id
 * @param {Y.Doc} doc - Document
 * @param {string[]} editorIds - Members who changed it
 * @return {Promise<void>} - Written or refused
 */

const savePageDoc = async (pageId: string, doc: Y.Doc, editorIds: string[]): Promise<void> => {
  const media = await prisma.pageMedia.findMany({ where: { pageId }, select: { id: true } })
  const ownMedia = new Set(media.map((entry) => entry.id))
  const json = yXmlFragmentToProsemirrorJSON(doc.getXmlFragment(PAGE_DOC_FIELD))
  const check = validateDocument(json, {
    isOwnMedia: (id) => ownMedia.has(id),
    newId: crypto.randomUUID,
  })

  // A broken document never reaches the database
  if (!check.ok) {
    logger.warn(`[pages] ${pageId} shared state refused: ${check.issue}`)
    return
  }

  const editorId = editorIds.at(-1) ?? null
  const contentAt = new Date()
  await prisma.page.update({
    where: { id: pageId },
    data: {
      yState: new Uint8Array(Y.encodeStateAsUpdate(doc)),
      content: check.document as unknown as Prisma.InputJsonValue,
      searchText: check.text,
      version: { increment: 1 },
      contentAt,
      ...(editorId ? { editedById: editorId } : {}),
    },
  })

  if (editorId) await snapshotRevision(pageId, editorId)
  await signalPage(pageId, PAGE_STREAM_EVENTS.saved, { contentAt: contentAt.toISOString() })
}

/**
 * Storage of one page's shared document
 * @param {string} pageId - Page id
 * @return {DocStore} - Store
 */

export const pageDocStore = (pageId: string): DocStore => ({
  load: () => pageSharedState(pageId),
  save: (doc, editorIds) => savePageDoc(pageId, doc, editorIds),
})
