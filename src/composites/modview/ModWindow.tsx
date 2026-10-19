'use client'

import type { ReactNode } from 'react'

import { WindowControls, windowMenu } from '@/composites/modview/workspace/WindowControls'
import { useWindowChrome } from '@/composites/modview/workspace/WindowChrome'
import { useMenu } from '@/managers/front-end'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_WINDOW } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ModWindowProps {
  title: ReactNode
  // Spoken name when the title is not text
  label?: string
  isLit?: boolean
  grow?: boolean
  // Body lays its own scroll out
  flush?: boolean
  actions?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * One window of the Mod View
 * @param {ReactNode} title - Heading
 * @param {string} [label] - Spoken name
 * @param {boolean} [isLit] - Lit by a scene
 * @param {boolean} [grow] - Fills its column
 * @param {boolean} [flush] - Body scrolls itself
 * @param {ReactNode} [actions] - Heading controls
 * @param {ReactNode} children - Content
 * @return {JSX.Element}
 */

export const ModWindow = ({
  title,
  label,
  isLit,
  grow,
  flush,
  actions,
  children,
  className,
}: ModWindowProps) => {
  const chrome = useWindowChrome()
  const { contextMenu } = useMenu()

  return (
    <section
      aria-label={label ?? (typeof title === 'string' ? title : undefined)}
      className={cn(
        MODVIEW_WINDOW.root,
        grow && MODVIEW_WINDOW.grow,
        isLit && MODVIEW_WINDOW.lit,
        chrome && MODVIEW_WINDOW.tiled,
        className
      )}
    >
      <header
        className={cn(MODVIEW_WINDOW.head, chrome && MODVIEW_WINDOW.headDraggable)}
        draggable={chrome ? true : undefined}
        onContextMenu={chrome ? contextMenu(windowMenu(chrome), label ?? '') : undefined}
        onDragStart={chrome?.onDragStart}
        onDragEnd={chrome?.onDragEnd}
        onDoubleClick={(event) => {
          // Only the bare heading, never a tab or a button
          if (event.target === event.currentTarget || event.target instanceof HTMLHeadingElement) {
            chrome?.commands.maximize()
          }
        }}
      >
        <h3 className={MODVIEW_WINDOW.title}>{title}</h3>
        {actions}
        {chrome && <WindowControls chrome={chrome} title={label ?? ''} />}
      </header>
      {!chrome?.isFolded && (
        <div className={flush ? MODVIEW_WINDOW.flush : MODVIEW_WINDOW.body}>{children}</div>
      )}
    </section>
  )
}

export interface WindowEmptyProps {
  icon: IconName
  title: string
  body: string
}

/**
 * Empty window
 * @param {IconName} icon - Glyph
 * @param {string} title - First line
 * @param {string} body - Second line
 * @return {JSX.Element}
 */

export const WindowEmpty = ({ icon, title, body }: WindowEmptyProps) => {
  const Icon = ICONS[icon]

  return (
    <div className={MODVIEW_WINDOW.empty}>
      <Icon className={MODVIEW_WINDOW.emptyIcon} aria-hidden="true" />
      <p className={MODVIEW_WINDOW.emptyTitle}>{title}</p>
      <p className={MODVIEW_WINDOW.emptyBody}>{body}</p>
    </div>
  )
}
