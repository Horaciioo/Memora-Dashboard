/**
 * Line kept in the technical log
 * @typedef {Object} LogLine
 * @property {number} at - Time in ms
 * @property {string} level - warn, error or sampled info
 * @property {string} text - Message
 * @property {string | null} requestId - Request that wrote it
 */

export interface LogLine {
  at: number
  level: string
  text: string
  requestId: string | null
}

/**
 * Circular buffer
 * @typedef {Object} LogRing
 */

export interface LogRing {
  push: (line: LogLine) => void
  read: (filter: { level?: string; since?: number; grep?: string; requestId?: string }) => LogLine[]
  size: () => number
}

/**
 * Buffer holding the newest lines
 * @param {number} capacity - Lines kept
 * @return {LogRing} - Ring
 */

export const createRing = (capacity: number): LogRing => {
  const lines: LogLine[] = []

  return {
    push: (line) => {
      lines.push(line)
      if (lines.length > capacity) lines.shift()
    },
    read: ({ level, since, grep, requestId }) => {
      const needle = grep?.toLowerCase()

      return lines.filter(
        (line) =>
          (!level || line.level === level) &&
          (since === undefined || line.at >= since) &&
          (!needle || line.text.toLowerCase().includes(needle)) &&
          (!requestId || line.requestId === requestId)
      )
    },
    size: () => lines.length,
  }
}

/**
 * Decide whether an info line is kept
 * @param {number} seenThisMinute - Info lines already seen this minute
 * @param {number} floor - Lines always kept per minute
 * @param {number} rate - Share kept past the floor
 * @param {number} roll - Random number between 0 and 1
 * @return {boolean} - Keep the line
 */

export const keepInfo = (
  seenThisMinute: number,
  floor: number,
  rate: number,
  roll: number
): boolean => seenThisMinute < floor || roll < rate
