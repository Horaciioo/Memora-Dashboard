'use client'

import type { MouseEvent } from 'react'

import { useMenu } from '@/managers/front-end'
import type { MenuItem } from '@/managers/front-end'

/**
 * Handlers opening one menu
 * @typedef {Object} ActionMenuHandlers
 * @property {(event: MouseEvent) => void} onClick - Opens the menu at the click
 * @property {(event: MouseEvent) => void} onContextMenu - Opens it on right click
 */

export interface ActionMenuHandlers {
  onClick: (event: MouseEvent) => void
  onContextMenu: (event: MouseEvent) => void
}

/**
 * Options of an element reached by a click or a right click, never by an edit icon
 * @param {MenuItem[]} items - Entries, none opening nothing
 * @param {string} [title] - Label above the entries
 * @return {ActionMenuHandlers} - Handlers to spread on the element
 */

export const useActionMenu = (items: MenuItem[], title?: string): ActionMenuHandlers => {
  const { openMenu, contextMenu } = useMenu()

  return {
    onClick: (event) => openMenu(items, { x: event.clientX, y: event.clientY }, title),
    onContextMenu: contextMenu(items, title),
  }
}
