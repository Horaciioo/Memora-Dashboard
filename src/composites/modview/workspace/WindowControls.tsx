'use client'

import type { MouseEvent } from 'react'

import type { WindowChrome } from '@/composites/modview/workspace/WindowChrome'
import { useMenu } from '@/managers/front-end'
import type { MenuItem } from '@/managers/front-end'
import { MODVIEW_WORKSPACE_COPY } from '@/declarations/modview/workspace'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_WINDOW } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface WindowControlsProps {
  chrome: WindowChrome
  title: string
}

/**
 * Menu of a window: sizes, fold, full screen, hide
 * @param {WindowChrome} chrome - Window chrome
 * @return {MenuItem[]} - Entries
 */

export const windowMenu = (chrome: WindowChrome): MenuItem[] => [
  {
    id: 'maximize',
    label: chrome.isMaximized ? MODVIEW_WORKSPACE_COPY.restore : MODVIEW_WORKSPACE_COPY.maximize,
    icon: 'expand',
    onSelect: chrome.commands.maximize,
  },
  {
    id: 'fold',
    label: chrome.isFolded ? MODVIEW_WORKSPACE_COPY.unfold : MODVIEW_WORKSPACE_COPY.fold,
    icon: 'expand',
    onSelect: chrome.commands.fold,
  },
  {
    id: 'taller',
    label: MODVIEW_WORKSPACE_COPY.taller,
    separatorBefore: true,
    onSelect: chrome.commands.taller,
  },
  {
    id: 'shorter',
    label: MODVIEW_WORKSPACE_COPY.shorter,
    onSelect: chrome.commands.shorter,
  },
  {
    id: 'wider',
    label: MODVIEW_WORKSPACE_COPY.wider,
    onSelect: chrome.commands.wider,
  },
  {
    id: 'narrower',
    label: MODVIEW_WORKSPACE_COPY.narrower,
    onSelect: chrome.commands.narrower,
  },
  {
    id: 'hide',
    label: MODVIEW_WORKSPACE_COPY.hide,
    icon: 'hidden',
    separatorBefore: true,
    onSelect: chrome.commands.hide,
  },
]

/**
 * Buttons of a window heading
 * @param {WindowControlsProps} props - Controls props
 * @return {JSX.Element}
 */

export const WindowControls = ({ chrome, title }: WindowControlsProps) => {
  const { openMenu } = useMenu()
  const FoldIcon = ICONS.expand

  const open = (event: MouseEvent) =>
    openMenu(windowMenu(chrome), { x: event.clientX, y: event.clientY }, title)

  return (
    <span className={MODVIEW_WINDOW.controls}>
      <button
        type="button"
        className={MODVIEW_WINDOW.control}
        aria-label={chrome.isFolded ? MODVIEW_WORKSPACE_COPY.unfold : MODVIEW_WORKSPACE_COPY.fold}
        aria-pressed={chrome.isFolded}
        draggable={false}
        onClick={chrome.commands.fold}
      >
        <FoldIcon
          className={cn(MODVIEW_WINDOW.controlIcon, !chrome.isFolded && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        className={MODVIEW_WINDOW.control}
        aria-label={MODVIEW_WORKSPACE_COPY.options}
        aria-haspopup="menu"
        draggable={false}
        onClick={open}
      >
        <ICONS.more className={MODVIEW_WINDOW.controlIcon} aria-hidden="true" />
      </button>
    </span>
  )
}
