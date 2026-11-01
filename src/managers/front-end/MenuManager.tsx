'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { MouseEvent, ReactNode } from 'react'

import { MenuLayer } from '@/managers/front-end/MenuLayer'
import { useLongPress } from '@/core/hooks/interaction/gestures/useLongPress'
import { isKeyboardShift } from '@/core/lib/ui/keyboard'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Entry of a floating menu
 * @typedef {Object} MenuItem
 * @property {string} id - Entry identifier
 * @property {string} label - Display label
 * @property {IconName} [icon] - Leading icon
 * @property {boolean} [danger] - Painted as destructive
 * @property {string} [shortcut] - Keyboard hint
 * @property {boolean} [disabled] - Blocks selection
 * @property {boolean} [separatorBefore] - Draws a rule above
 * @property {string} [section] - Heading above the entry
 * @property {MenuItem[]} [submenu] - Entries of a flyout
 * @property {() => void} [onSelect] - Selection handler
 */

export interface MenuItem {
  id: string
  label: string
  icon?: IconName
  danger?: boolean
  shortcut?: string
  disabled?: boolean
  separatorBefore?: boolean
  section?: string
  submenu?: MenuItem[]
  onSelect?: () => void
}

/**
 * Open menu state
 * @typedef {Object} OpenMenu
 * @property {string} [title] - Section label above the entries
 * @property {boolean} [searchable] - Shows a search field
 * @property {MenuItem[]} items - Entries
 * @property {number} x - Screen x coordinate
 * @property {number} y - Screen y coordinate
 */

interface OpenMenu {
  title?: string
  searchable?: boolean
  items: MenuItem[]
  x: number
  y: number
}

/**
 * Menu context
 * @typedef {Object} MenuContextValue
 * @property {(items: MenuItem[], origin: {x: number, y: number}, title?: string, searchable?: boolean) => void} openMenu - Raise a menu
 * @property {(items: MenuItem[], title?: string) => (event: MouseEvent) => void} contextMenu - Right click handler
 * @property {() => void} closeMenu - Dismiss the menu
 */

interface MenuContextValue {
  openMenu: (items: MenuItem[], origin: { x: number; y: number }, title?: string, searchable?: boolean) => void
  contextMenu: (items: MenuItem[], title?: string) => (event: MouseEvent) => void
  closeMenu: () => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

// Room kept so the panel never overflows the viewport
const EDGE_MARGIN = 12
const ESTIMATED_WIDTH = 224
const ITEM_HEIGHT = 32

/**
 * Menu provider
 * @param {Object} props - Provider config
 * @param {ReactNode} props.children - Tree children
 * @return {JSX.Element} - Provider with layer
 */

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menu, setMenu] = useState<OpenMenu | null>(null)

  const closeMenu = useCallback(() => setMenu(null), [])

  useLongPress()

  const openMenu = useCallback(
    (items: MenuItem[], origin: { x: number; y: number }, title?: string, searchable?: boolean) => {
      if (items.length === 0) return

      // Flip the panel back inside the viewport when it would overflow
      const height = items.length * ITEM_HEIGHT + (title ? ITEM_HEIGHT : 0)
      const x = Math.min(origin.x, window.innerWidth - ESTIMATED_WIDTH - EDGE_MARGIN)
      const y = Math.min(origin.y, window.innerHeight - height - EDGE_MARGIN)

      setMenu({ items, title, searchable, x: Math.max(EDGE_MARGIN, x), y: Math.max(EDGE_MARGIN, y) })
    },
    []
  )

  const contextMenu = useCallback(
    (items: MenuItem[], title?: string) => (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      openMenu(items, { x: event.clientX, y: event.clientY }, title)
    },
    [openMenu]
  )

  useEffect(() => {
    if (!menu) return

    const width = window.innerWidth
    const dismiss = (event: Event) => {
      // A feed that scrolls by itself never closes a menu
      if (event.target instanceof Element && event.target.closest('[data-keep-menu]')) return
      // A keyboard opening is not a move away
      if (!isKeyboardShift(event, width)) closeMenu()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }

    window.addEventListener('resize', dismiss)
    window.addEventListener('scroll', dismiss, true)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('scroll', dismiss, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menu, closeMenu])

  const value = useMemo<MenuContextValue>(
    () => ({ openMenu, contextMenu, closeMenu }),
    [openMenu, contextMenu, closeMenu]
  )

  return (
    <MenuContext.Provider value={value}>
      {children}
      {menu && <MenuLayer menu={menu} onClose={closeMenu} />}
    </MenuContext.Provider>
  )
}

/**
 * Use menu
 * @return {MenuContextValue} - Menu actions
 */

export const useMenu = (): MenuContextValue => {
  const context = useContext(MenuContext)
  if (!context) throw new Error('useMenu must be used within MenuProvider')

  return context
}
