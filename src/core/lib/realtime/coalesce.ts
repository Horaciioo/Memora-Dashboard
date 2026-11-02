/**
 * Run at once, then at most once more per window
 * @param {() => void} run - Work to do
 * @param {number} waitMs - Window
 * @return {{ request: () => void, cancel: () => void }} - Trigger and stop
 */

export const coalesce = (run: () => void, waitMs: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  let isDirty = false

  // Window closed, one trailing run if asked meanwhile
  const settle = () => {
    timer = null
    if (!isDirty) return
    isDirty = false
    run()
    timer = setTimeout(settle, waitMs)
  }

  return {
    request: () => {
      if (timer) {
        isDirty = true
        return
      }
      run()
      timer = setTimeout(settle, waitMs)
    },
    cancel: () => {
      if (timer) clearTimeout(timer)
      timer = null
      isDirty = false
    },
  }
}
