/**
 * Frame loop of a sea
 * @typedef {Object} OceanLoopHooks
 * @property {(now: number) => void} tick - One frame, decides itself whether to paint
 * @property {() => void} wake - Called back on resize and on return to sight
 * @property {() => void} rest - Called back when the loop stops, hidden or out of sight
 */

export interface OceanLoopHooks {
  tick: (now: number) => void
  wake: () => void
  rest: () => void
}

/**
 * Frame loop that runs only while the tab is shown and the sea is on screen
 * @param {HTMLElement} element - Painted element
 * @param {OceanLoopHooks} hooks - Frame and wake-ups
 * @return {() => void} - Stops the loop and its watchers
 */

export const oceanLoop = (element: HTMLElement, { tick, wake, rest }: OceanLoopHooks) => {
  let frameId = 0
  let isSeen = true
  const run = (now: number) => {
    frameId = requestAnimationFrame(run)
    tick(now)
  }
  const sync = () => {
    const shouldRun = isSeen && document.visibilityState === 'visible'
    if (shouldRun && !frameId) {
      wake()
      frameId = requestAnimationFrame(run)
    }
    if (!shouldRun && frameId) {
      cancelAnimationFrame(frameId)
      frameId = 0
      rest()
    }
  }
  const sizer = new ResizeObserver(wake)
  sizer.observe(element)
  const sight = new IntersectionObserver(([entry]) => {
    isSeen = entry?.isIntersecting ?? true
    sync()
  })
  sight.observe(element)
  document.addEventListener('visibilitychange', sync)
  sync()

  return () => {
    cancelAnimationFrame(frameId)
    frameId = 0
    sizer.disconnect()
    sight.disconnect()
    document.removeEventListener('visibilitychange', sync)
  }
}
