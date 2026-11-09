// Wait to gather a batch
const BATCH_MS = 150

export type AvatarLoader = (ids: string[]) => Promise<Record<string, string | null>>

export interface AvatarBook {
  read: (id: string) => string | null | undefined
  ask: (id: string) => void
  subscribe: (listener: () => void) => () => void
}

/**
 * Pictures learned in batches
 * @param {AvatarLoader} load - Batch fetch
 * @return {AvatarBook} - Book
 */

export const createAvatarBook = (load: AvatarLoader): AvatarBook => {
  const known = new Map<string, string | null>()
  const asked = new Set<string>()
  const listeners = new Set<() => void>()
  let waiting: string[] = []
  let timer: ReturnType<typeof setTimeout> | null = null

  // Fetch the gathered batch
  const flush = async () => {
    timer = null
    const ids = waiting
    waiting = []
    const answer = await load(ids).catch(() => ({}) as Record<string, string | null>)
    for (const id of ids) known.set(id, answer[id] ?? null)
    listeners.forEach((listener) => listener())
  }

  return {
    read: (id) => known.get(id),
    ask: (id) => {
      if (asked.has(id)) return
      asked.add(id)
      waiting.push(id)
      timer ??= setTimeout(flush, BATCH_MS)
    },
    subscribe: (listener) => {
      listeners.add(listener)

      return () => listeners.delete(listener)
    },
  }
}
