/**
 * Batcher options
 * @typedef {Object} BatcherOptions
 * @property {number} intervalMs - Flush delay
 * @property {number} maxItems - Items per write
 * @property {number} capacity - Items held at most
 * @property {(items: T[]) => Promise<void>} write - Batch writer
 * @property {() => void} [onDrop] - Called when full
 */

export interface BatcherOptions<T> {
  intervalMs: number
  maxItems: number
  capacity: number
  write: (items: T[]) => Promise<void>
  onDrop?: () => void
}

/**
 * Gather items then write them by batches
 * @param {BatcherOptions<T>} options - Batcher options
 * @return {{ push: (item: T) => void, flush: () => Promise<void> }} - Batcher
 */

export const createBatcher = <T>(options: BatcherOptions<T>) => {
  const waiting: T[] = []
  let timer: ReturnType<typeof setTimeout> | null = null
  // Writes never overlap
  let running: Promise<void> = Promise.resolve()

  // Write every held batch
  const drain = (): Promise<void> => {
    running = running.then(async () => {
      while (waiting.length > 0) {
        const batch = waiting.splice(0, options.maxItems)
        await options.write(batch).catch(() => null)
      }
    })

    return running
  }

  const schedule = (): void => {
    if (timer) return
    timer = setTimeout(() => {
      timer = null
      void drain()
    }, options.intervalMs)
  }

  return {
    push: (item: T): void => {
      // A flood never grows memory
      if (waiting.length >= options.capacity) {
        options.onDrop?.()
        return
      }

      waiting.push(item)
      if (waiting.length >= options.maxItems) void drain()
      else schedule()
    },
    flush: (): Promise<void> => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }

      return drain()
    },
  }
}
