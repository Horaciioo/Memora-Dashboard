// Read by the seed on plain node
export const CREATOR_TOKEN = '{creator}'
export const CREATOR_LOGIN_TOKEN = '{creator_login}'

/**
 * Chat login of a creator
 * @param {string} name - Display name
 * @return {string} - Lower case, no accent, no space
 */

export const loginOf = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

/**
 * Put the creator's name where a course left its token, in every text of the value
 * @param {T} value - Course, scene or any plain data
 * @param {string} name - Creator the course is about
 * @return {T} - Same shape with the name in place
 */

export const fillCreator = <T>(value: T, name: string): T => {
  const login = loginOf(name)

  const walk = (node: unknown): unknown => {
    if (typeof node === 'string') {
      return node.replaceAll(CREATOR_LOGIN_TOKEN, login).replaceAll(CREATOR_TOKEN, name)
    }
    if (Array.isArray(node)) return node.map(walk)
    if (node !== null && typeof node === 'object') {
      const prototype = Object.getPrototypeOf(node)
      if (prototype !== Object.prototype && prototype !== null) return node

      return Object.fromEntries(Object.entries(node).map(([key, entry]) => [key, walk(entry)]))
    }

    return node
  }

  return walk(value) as T
}
