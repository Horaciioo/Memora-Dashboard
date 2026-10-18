'use client'

import { createContext, useContext } from 'react'
import type { DragEventHandler } from 'react'

import type { ModViewWindow } from '@/types/modview'

/**
 * What the workspace hands each window to move and size itself
 * @typedef {Object} WindowChrome
 * @property {ModViewWindow} id - Window
 * @property {boolean} isFolded - Reduced to its heading
 * @property {boolean} isMaximized - Filling the workspace
 * @property {DragEventHandler} onDragStart - Start moving
 * @property {DragEventHandler} onDragEnd - Stop moving
 * @property {Record<'fold' | 'maximize' | 'taller' | 'shorter' | 'wider' | 'narrower' | 'hide', () => void>} commands - Sizing gestures
 */

export interface WindowChrome {
  id: ModViewWindow
  isFolded: boolean
  isMaximized: boolean
  onDragStart: DragEventHandler
  onDragEnd: DragEventHandler
  commands: Record<
    'fold' | 'maximize' | 'taller' | 'shorter' | 'wider' | 'narrower' | 'hide',
    () => void
  >
}

const WindowChromeContext = createContext<WindowChrome | null>(null)

export const WindowChromeProvider = WindowChromeContext.Provider

/**
 * Chrome of the window it sits in, none outside the workspace
 * @return {WindowChrome | null}
 */

export const useWindowChrome = (): WindowChrome | null => useContext(WindowChromeContext)
