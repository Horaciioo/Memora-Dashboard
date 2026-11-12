import type { UnbanFormSnapshot, UnbanQuestion } from '@/declarations/unban/form'

/**
 * Questions that moved between two forms
 * @typedef {Object} FormChange
 * @property {string[]} added - Labels of new questions
 * @property {string[]} removed - Labels of dropped questions
 * @property {string[]} changed - Labels of edited questions
 */

export interface FormChange {
  added: string[]
  removed: string[]
  changed: string[]
}

/**
 * Questions keyed by identifier
 * @param {UnbanFormSnapshot} snapshot - Form
 * @return {Map<string, UnbanQuestion>} - Questions by id
 */

const byId = (snapshot: UnbanFormSnapshot): Map<string, UnbanQuestion> =>
  new Map(snapshot.questions.map((question) => [question.id, question]))

/**
 * Compare two forms
 * @param {UnbanFormSnapshot} before - Earlier form
 * @param {UnbanFormSnapshot} after - Later form
 * @return {FormChange} - Differences
 */

export const diffSnapshots = (before: UnbanFormSnapshot, after: UnbanFormSnapshot): FormChange => {
  const previous = byId(before)
  const next = byId(after)

  return {
    added: after.questions.filter((question) => !previous.has(question.id)).map((q) => q.label),
    removed: before.questions.filter((question) => !next.has(question.id)).map((q) => q.label),
    changed: after.questions
      .filter((question) => {
        const old = previous.get(question.id)

        return old !== undefined && JSON.stringify(old) !== JSON.stringify(question)
      })
      .map((question) => question.label),
  }
}

/**
 * Whether two forms differ at all
 * @param {UnbanFormSnapshot} before - Earlier form
 * @param {UnbanFormSnapshot} after - Later form
 * @return {boolean} - Anything differs
 */

export const hasChanged = (before: UnbanFormSnapshot, after: UnbanFormSnapshot): boolean =>
  JSON.stringify(before) !== JSON.stringify(after)
