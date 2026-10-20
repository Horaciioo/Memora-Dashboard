/**
 * Member that a remark can name
 * @typedef {Object} MentionOption
 * @property {string} id - Account identifier
 * @property {string} name - Display name
 * @property {string | null} image - Portrait URL
 * @property {string | null} hint - Division of the member
 */

export interface MentionOption {
  id: string
  name: string
  image: string | null
  hint: string | null
}

/**
 * Mention the viewer found on opening a record
 * @typedef {Object} MentionMark
 * @property {string | null} actorName - Who wrote the remark
 * @property {string} at - ISO moment the mention was raised
 */

export interface MentionMark {
  actorName: string | null
  at: string
}
