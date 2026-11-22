import type { ReactNode } from 'react'

import { PLAY_HEAD_PAGES } from '@/declarations/play'
import type { PlayHeadPage } from '@/declarations/play'
import { PLAY_HEAD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayPageTitleProps {
  children: string
  // Page, giving the line under the title
  page?: PlayHeadPage
  // Figures on the right of the title row
  aside?: ReactNode
  // Content under the title: flat under a page, in a showcase panel under a section
  body?: ReactNode
  className?: string
  // Section panel under a page title
  heading?: 'h1' | 'h2'
  // Right of a panel bar
  action?: ReactNode
  // Body already made of nested cards, no group around it
  isGrouped?: boolean
  // Game name, kept for callers that tint a section
  game?: string
}

/**
 * Plain page title with its figures, or a showcase panel with a title bar
 * @param {PlayPageTitleProps} props - Title, line, figures, content
 * @return {JSX.Element}
 */

export const PlayPageTitle = ({
  children,
  page,
  aside,
  body,
  className,
  action,
  isGrouped,
  heading: Heading = 'h1',
}: PlayPageTitleProps) => {
  if (Heading === 'h2') {
    return (
      <section className={cn(PLAY_HEAD.panel, className)}>
        <div className={PLAY_HEAD.panelBar}>
          <Heading className={PLAY_HEAD.panelTitle}>{children}</Heading>
          {action}
        </div>
        {body !== undefined && (
          <div className={isGrouped ? PLAY_HEAD.panelBody : PLAY_HEAD.panelGroup}>{body}</div>
        )}
      </section>
    )
  }

  return (
    <div className={cn(PLAY_HEAD.root, className)}>
      <header className={PLAY_HEAD.top}>
        <div className={PLAY_HEAD.text}>
          <Heading className={PLAY_HEAD.title}>{children}</Heading>
          {page && <p className={PLAY_HEAD.note}>{PLAY_HEAD_PAGES[page]}</p>}
        </div>
        {aside && <div className={PLAY_HEAD.aside}>{aside}</div>}
      </header>
      {body !== undefined && <div className={PLAY_HEAD.body}>{body}</div>}
    </div>
  )
}
