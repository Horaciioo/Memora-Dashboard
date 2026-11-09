/**
 * Flag saved in the browser
 * @param {string} key - Storage key
 * @return {boolean} - Flag set
 */

export const readStoredFlag = (key: string): boolean => {
  try {
    return window.localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}
