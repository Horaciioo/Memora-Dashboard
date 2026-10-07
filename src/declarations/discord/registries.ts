/**
 * Member mention Discord reads
 * @param {string} id - Discord identifier
 * @return {string} - Mention token
 */

export const memberToken = (id: string): string => `<@${id}>`

/**
 * Mentions every server knows
 * @type {readonly string[]}
 */

export const BROADCAST_MENTIONS: readonly string[] = ['@everyone', '@here']
