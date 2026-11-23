import { chapterLength } from '@/core/lib/recap/lines'
import type { ScenarioLine } from '@/types/scenario'

/**
 * Letters Memora writes for one line, what hangs under it included
 * @param {ScenarioLine} line - Line of a talk
 * @return {number} - Letters
 */

export const writtenLength = (line: ScenarioLine): number => {
  if (typeof line === 'string') return line.length

  const own = line.text.length
  if ('items' in line) return own + line.items.reduce((total, item) => total + item.length, 0)
  if ('groups' in line) {
    return (
      own +
      line.groups.reduce(
        (total, group) =>
          total + group.title.length + group.items.reduce((sum, item) => sum + item.length, 0),
        0
      )
    )
  }
  if ('recap' in line) return own + chapterLength(line.recap)

  return own
}

/**
 * What is visible of several texts written one after the other
 * @param {string[]} texts - Texts in writing order
 * @param {number} written - Letters written so far, all texts together
 * @return {string[]} - Visible part of each text
 */

export const sliceWritten = (texts: string[], written: number): string[] =>
  texts.map((text, index) => {
    const before = texts.slice(0, index).reduce((total, other) => total + other.length, 0)

    return text.slice(0, Math.max(written - before, 0))
  })
