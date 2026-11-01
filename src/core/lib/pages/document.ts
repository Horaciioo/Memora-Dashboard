import type { Node as ProseNode } from '@tiptap/pm/model'

import { API_ROUTES } from '@/core/lib/api/routes'
import { isSafeHref } from '@/core/lib/pages/links'
import { BLOCK_ID_ATTRIBUTE, BLOCK_NODE_TYPES, PAGE_SCHEMA } from '@/core/lib/pages/schema'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import type { PageDocument } from '@/types/pages'

/**
 * Why a document was refused
 * @type {'size' | 'shape' | 'depth' | 'count' | 'link' | 'image' | 'subpage'}
 */

export type DocumentIssue = 'size' | 'shape' | 'depth' | 'count' | 'link' | 'image' | 'subpage'

/**
 * Outcome of a document check
 * @typedef {Object} DocumentCheck
 */

export type DocumentCheck =
  | { ok: true; document: PageDocument; text: string; mediaIds: string[]; subpageIds: string[] }
  | { ok: false; issue: DocumentIssue }

/**
 * What the document may point at
 * @typedef {Object} DocumentContext
 * @property {(mediaId: string) => boolean} isOwnMedia - Media of this page
 * @property {() => string} newId - Block id factory
 */

export interface DocumentContext {
  isOwnMedia: (mediaId: string) => boolean
  newId: () => string
}

const BLOCK_TYPES = new Set(BLOCK_NODE_TYPES)
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Document holding one empty line
 * @return {PageDocument} - Blank document
 */

export const emptyDocument = (): PageDocument => ({ type: 'doc', content: [{ type: 'paragraph' }] })

/**
 * Media id behind an image source
 * @param {string} source - Image address
 * @return {string | null} - Media id
 */

export const mediaIdOf = (source: string): string | null => {
  const id = source.split('/').at(-1) ?? ''

  return UUID_PATTERN.test(id) && API_ROUTES.pageMedia(id) === source ? id : null
}

/**
 * Parse raw JSON against the schema
 * @param {unknown} raw - Untrusted document
 * @return {ProseNode | null} - Parsed tree
 */

const parseTree = (raw: unknown): ProseNode | null => {
  if (typeof raw !== 'object' || raw === null || (raw as { type?: unknown }).type !== 'doc') {
    return null
  }

  try {
    const tree = PAGE_SCHEMA.nodeFromJSON(raw)
    tree.check()

    return tree
  } catch {
    return null
  }
}

/**
 * Find the first rule a tree breaks
 * @param {ProseNode} tree - Parsed document
 * @param {DocumentContext} context - Allowed targets
 * @return {DocumentIssue | null} - Broken rule
 */

const findIssue = (tree: ProseNode, context: DocumentContext): DocumentIssue | null => {
  let issue: DocumentIssue | null = null
  let count = 0

  tree.descendants((node, pos) => {
    if (issue) return false
    count += 1

    // Size and nesting bounds
    if (count > PAGE_SETTINGS.documentMaxNodes) issue = 'count'
    else if (tree.resolve(pos).depth >= PAGE_SETTINGS.documentMaxDepth) issue = 'depth'
    // Targets a block may point at
    else if (node.marks.some((mark) => mark.type.name === 'link' && !isSafeHref(String(mark.attrs.href ?? '')))) issue = 'link'
    else if (node.type.name === 'image' && !isOwnImage(node, context)) issue = 'image'
    else if (node.type.name === 'subpage' && !UUID_PATTERN.test(String(node.attrs.pageId ?? ''))) issue = 'subpage'

    return !issue
  })

  return issue
}

/**
 * Image source points at this page
 * @param {ProseNode} node - Image node
 * @param {DocumentContext} context - Allowed targets
 * @return {boolean} - Own media
 */

const isOwnImage = (node: ProseNode, context: DocumentContext): boolean => {
  const id = mediaIdOf(String(node.attrs.src ?? ''))

  return id !== null && context.isOwnMedia(id)
}

/**
 * Give every block a single id
 * @param {PageDocument} json - Parsed document
 * @param {() => string} newId - Id factory
 * @return {PageDocument} - Document with unique ids
 */

const assignIds = (json: PageDocument, newId: () => string): PageDocument => {
  const seen = new Set<string>()

  const visit = (node: PageDocument): PageDocument => {
    const children = node.content?.map(visit)
    if (!BLOCK_TYPES.has(node.type)) return children ? { ...node, content: children } : node

    // Missing or repeated ids are renewed
    const current = node.attrs?.[BLOCK_ID_ATTRIBUTE]
    const id = typeof current === 'string' && current && !seen.has(current) ? current : newId()
    seen.add(id)

    return { ...node, attrs: { ...node.attrs, [BLOCK_ID_ATTRIBUTE]: id }, ...(children ? { content: children } : {}) }
  }

  return visit(json)
}

/**
 * Collect attribute values of one node type
 * @param {ProseNode} tree - Parsed document
 * @param {string} type - Node type
 * @param {(node: ProseNode) => string | null} read - Value reader
 * @return {string[]} - Distinct values
 */

const collect = (tree: ProseNode, type: string, read: (node: ProseNode) => string | null): string[] => {
  const values = new Set<string>()

  tree.descendants((node) => {
    const value = node.type.name === type ? read(node) : null
    if (value) values.add(value)
  })

  return [...values]
}

/**
 * Plain text of a document
 * @param {ProseNode} tree - Parsed document
 * @return {string} - Searchable text
 */

export const documentText = (tree: ProseNode): string =>
  tree.textBetween(0, tree.content.size, '\n', ' ').replace(/\n{2,}/g, '\n').trim()

/**
 * Check and normalise an untrusted document
 * @param {unknown} raw - Document sent by a client
 * @param {DocumentContext} context - Allowed targets
 * @return {DocumentCheck} - Normalised document or the broken rule
 */

export const validateDocument = (raw: unknown, context: DocumentContext): DocumentCheck => {
  if (JSON.stringify(raw ?? null).length > PAGE_SETTINGS.documentMaxBytes) return { ok: false, issue: 'size' }

  const tree = parseTree(raw)
  if (!tree) return { ok: false, issue: 'shape' }

  const issue = findIssue(tree, context)
  if (issue) return { ok: false, issue }

  return {
    ok: true,
    document: assignIds(tree.toJSON() as PageDocument, context.newId),
    text: documentText(tree),
    mediaIds: collect(tree, 'image', (node) => mediaIdOf(String(node.attrs.src ?? ''))),
    subpageIds: collect(tree, 'subpage', (node) => (node.attrs.pageId as string | null) ?? null),
  }
}
