/**
 * Remark left on a record
 * @typedef {Object} CommentView
 * @property {string} id - Comment identifier
 * @property {string | null} authorName - Who wrote it
 * @property {string | null} authorAvatar - Portrait of who wrote it
 * @property {string} body - Written trace
 * @property {string} createdAt - ISO moment it was written
 * @property {string | null} [questionKey] - Question it was left under
 * @property {boolean} [pinned] - Held on the rail
 */

export interface CommentView {
  id: string
  authorName: string | null
  authorAvatar: string | null
  body: string
  createdAt: string
  questionKey?: string | null
  pinned?: boolean
}
