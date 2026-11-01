/**
 * Every signed-in member owns pages, moderators included
 * @param {object | null} member - Signed-in member
 * @return {boolean} - May create pages
 */

export const canOwnPages = (member: object | null): boolean => !!member
