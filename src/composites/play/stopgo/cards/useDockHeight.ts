import { useCallback, useRef } from 'react'

/**
 * Callback ref of the dock, its height goes to the board as --stopgo-dock-h
 * @return {(node: HTMLDivElement | null) => void} - Ref to put on the dock
 */

export const useDockHeight = () => {
  const stop = useRef<(() => void) | null>(null)

  return useCallback((node: HTMLDivElement | null) => {
    stop.current?.()
    stop.current = null
    const board = node?.parentElement
    if (!node || !board) return
    const write = () => board.style.setProperty('--stopgo-dock-h', `${node.offsetHeight}px`)
    write()
    const watch = new ResizeObserver(write)
    watch.observe(node)
    stop.current = () => {
      watch.disconnect()
      board.style.removeProperty('--stopgo-dock-h')
    }
  }, [])
}
