import { clsx, type ClassValue } from 'clsx'

/**
 * Merge conditional class names
 * @param {ClassValue[]} values - Class values to merge
 * @return {string} - Combined class list
 */

export const cn = (...values: ClassValue[]) => clsx(values)
