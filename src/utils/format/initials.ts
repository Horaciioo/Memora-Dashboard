/**
 * Build the fallback initials of a name
 * @param {string} name - Display name
 * @return {string} - Up to two letters
 */

export const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
