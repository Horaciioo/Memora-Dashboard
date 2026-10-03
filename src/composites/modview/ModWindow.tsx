'use client'

import type { ReactNode } from 'react'

import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_WINDOW } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ModWindowProps {
  title: string
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
 * @param {string} title - Heading
 * @param {boolean} [isLit] - Lit by a scene
 * @param {boolean} [grow] - Fills its column
 * @param {boolean} [flush] - Body scrolls itself
 * @param {ReactNode} [actions] - Heading controls
 * @param {ReactNode} children - Content
 * @return {JSX.Element}
 */

export const ModWindow = ({
  title,
  isLit,
  grow,
  flush,
  actions,
  children,
  className,
}: ModWindowProps) => (
  <section
    aria-label={title}
    className={cn(
      MODVIEW_WINDOW.root,
      grow && MODVIEW_WINDOW.grow,
      isLit && MODVIEW_WINDOW.lit,
      className
    )}
  >
    <header className={MODVIEW_WINDOW.head}>
      <h3 className={MODVIEW_WINDOW.title}>{title}</h3>
      {actions}
    </header>
    <div className={flush ? MODVIEW_WINDOW.flush : MODVIEW_WINDOW.body}>{children}</div>
  </section>
)

export interface WindowEmptyProps {
  icon: IconName
  title: string
  body: string
}

/**
 * Empty window, a glyph and two lines
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
