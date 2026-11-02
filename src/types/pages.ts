import type {
  GrantableLevelName,
  PageLevelName,
  PageShareScopeName,
} from '@/declarations/pages/access'
import type { MemberRoleName } from '@/utils/constants/hierarchy'

/**
 * Stored block document, ProseMirror JSON
 * @typedef {Object} PageDocument
 * @property {string} type - Node type
 * @property {Record<string, unknown>} [attrs] - Node attributes
 * @property {PageDocument[]} [content] - Child nodes
 * @property {string} [text] - Text of a text node
 * @property {{ type: string, attrs?: Record<string, unknown> }[]} [marks] - Inline marks
 */

export interface PageDocument {
  type: string
  attrs?: Record<string, unknown>
  content?: PageDocument[]
  text?: string
  marks?: { type: string; attrs?: Record<string, unknown> }[]
}

/**
 * Page as the tree lists it
 * @typedef {Object} PageSummary
 * @property {string} id - Page id
 * @property {string | null} parentId - Parent page
 * @property {string | null} categoryId - Category of a root page
 * @property {string} title - Title
 * @property {string | null} icon - Emoji
 * @property {number} position - Order among siblings
 * @property {boolean} isOwn - Viewer owns it
 * @property {boolean} isShared - Reaches someone else
 * @property {string} updatedAt - Last change
 */

export interface PageSummary {
  id: string
  parentId: string | null
  categoryId: string | null
  title: string
  icon: string | null
  position: number
  isOwn: boolean
  isShared: boolean
  updatedAt: string
}

/**
 * Step of the page trail
 * @typedef {Object} PageCrumb
 * @property {string} id - Page id
 * @property {string} title - Title
 * @property {string | null} icon - Emoji
 */

export interface PageCrumb {
  id: string
  title: string
  icon: string | null
}

/**
 * Page opened in the editor
 * @typedef {Object} PageDetail
 */

export interface PageDetail extends PageSummary {
  ownerId: string
  ownerName: string
  ownerImage: string | null
  coverUrl: string | null
  content: PageDocument
  version: number
  level: PageLevelName
  inheritAccess: boolean
  trail: PageCrumb[]
  children: PageSummary[]
  trashedAt: string | null
  createdAt: string
  contentAt: string
  editorName: string | null
  // Someone else may open it
  isCollaborative: boolean
  // Shared editing state, base64
  yState: string
}

/**
 * One share of a page
 * @typedef {Object} PageShare
 */

export interface PageShare {
  id: string
  scope: PageShareScopeName
  level: GrantableLevelName
  accountId: string | null
  role: MemberRoleName | null
  name: string
  image: string | null
  // Page the share sits on when inherited
  fromPage: PageCrumb | null
}

/**
 * Sharing state of a page
 * @typedef {Object} PageSharing
 */

export interface PageSharing {
  owner: { id: string; name: string; image: string | null }
  shares: PageShare[]
  inheritAccess: boolean
  parent: PageCrumb | null
  level: PageLevelName
}

/**
 * Page waiting in the trash
 * @typedef {Object} TrashedPage
 */

export interface TrashedPage extends PageCrumb {
  trashedAt: string
}

/**
 * Comment on a page
 * @typedef {Object} PageCommentView
 */

export interface PageCommentView {
  id: string
  // Root comment of a reply
  parentId: string | null
  blockId: string | null
  body: string
  authorId: string | null
  authorName: string
  authorImage: string | null
  resolvedAt: string | null
  createdAt: string
  isMine: boolean
}

/**
 * Search hit
 * @typedef {Object} PageSearchHit
 */

export interface PageSearchHit {
  id: string
  title: string
  icon: string | null
  excerpt: string
  trail: string[]
}

/**
 * Admin registry row, never the content
 * @typedef {Object} PageRegistryRow
 */

export interface PageRegistryRow {
  id: string
  title: string
  icon: string | null
  ownerName: string
  ownerImage: string | null
  parentTitle: string | null
  inheritAccess: boolean
  shares: { label: string; level: GrantableLevelName }[]
  createdAt: string
  contentAt: string
  trashedAt: string | null
}

/**
 * Folder of the private rail
 * @typedef {Object} PageCategoryView
 * @property {string} id - Category id
 * @property {string} name - Name
 * @property {number} position - Order among categories
 */

export interface PageCategoryView {
  id: string
  name: string
  position: number
}

/**
 * Kept version of a page
 * @typedef {Object} PageRevisionSummary
 */

export interface PageRevisionSummary {
  id: string
  version: number
  title: string
  createdAt: string
  authorName: string | null
}

/**
 * Kept version with its content
 * @typedef {Object} PageRevisionDetail
 */

export interface PageRevisionDetail extends PageRevisionSummary {
  content: PageDocument
}
