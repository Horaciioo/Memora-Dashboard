/**
 * Address segment of a creator, lower case, accents and symbols removed
 * @param {string} name - Creator name
 * @return {string} - Slug such as michou
 */

export const creatorSlug = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Permanent public path of a creator's form
 * @param {string} name - Creator name
 * @return {string} - Path such as /michou/contest
 */

export const contestPath = (name: string): string => `/${creatorSlug(name)}/contest`
