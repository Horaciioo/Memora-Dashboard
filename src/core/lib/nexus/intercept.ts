/**
 * Text meant for the console
 * @param {string} text - Typed text
 * @return {boolean} - First visible character is a dollar sign
 */

export const isNexusInput = (text: string): boolean => text.trimStart().startsWith('$')
