import { fillTemplate } from '@/utils/format/strings'

// Wordings kept per bank, so one is never said twice in a row
const recent = new Map<string, number[]>()

// Recent wordings set aside before drawing
const MEMORY = 2

/**
 * One wording drawn from a bank, never one of the last used
 * @param {string} key - Bank name, memory is kept per key
 * @param {readonly string[]} bank - Wordings of the same meaning
 * @param {Record<string, string>} [values] - Placeholders filled in
 * @return {string} - The line, filled in
 */

export const varied = (
  key: string,
  bank: readonly string[],
  values: Record<string, string> = {}
): string => {
  const last = recent.get(key) ?? []
  const free = bank.map((_, index) => index).filter((index) => !last.includes(index))
  const pool = free.length > 0 ? free : bank.map((_, index) => index)
  const pick = pool[Math.floor(Math.random() * pool.length)]

  recent.set(key, [...last, pick].slice(-Math.min(MEMORY, bank.length - 1)))

  return fillTemplate(bank[pick], values)
}

/**
 * Forget what was said, a new talk starts from nothing
 * @return {void}
 */

export const forgetVariants = (): void => recent.clear()
