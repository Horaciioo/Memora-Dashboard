/**
 * Remark left on a record
 * @typedef {Object} CommentView
 * @property {string} id - Comment identifier
 * @property {string | null} authorName - Who wrote it
 * @property {string} body - Written trace
 * @property {string} createdAt - ISO moment it was written
 */

export interface CommentView {
  id: string
  authorName: string | null
  body: string
  createdAt: string
}
