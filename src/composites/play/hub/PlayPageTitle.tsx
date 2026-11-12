import type { CSSProperties, ReactNode } from 'react'

import { PLAY_SCROLL } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayPageTitleProps {
  children: string
  // Game whose colour dyes the ribbon, Memora pink without
  game?: string
  // Box unrolled under the ribbon, narrower than it
  body?: ReactNode
  className?: string
  // Section ribbon under a page title
  heading?: 'h1' | 'h2'
}

// Two folded layers per end, mirrored on the right
const RibbonTail = ({ side }: { side: 'left' | 'right' }) => (
  <svg
    viewBox="0 0 80 70"
    preserveAspectRatio="none"
    className={cn(PLAY_SCROLL.tail, side === 'left' ? PLAY_SCROLL.tailLeft : PLAY_SCROLL.tailRight)}
    aria-hidden="true"
  >
    <path className={PLAY_SCROLL.tailBack} d="M76 12 L8 2 L24 20 L6 36 L76 42 Z" />
    <path className={PLAY_SCROLL.tailBody} d="M76 24 L20 20 L34 42 L16 64 L76 68 Z" />
    <path className={PLAY_SCROLL.tailLip} d="M16 64 L76 68" />
  </svg>
)

/**
 * Ribbon title, with an optional scroll box tucked under it
 * @param {PlayPageTitleProps} props - Title, game colour, box content
 * @return {JSX.Element}
 */

export const PlayPageTitle = ({
  children,
  game,
  body,
  className,
  heading: Heading = 'h1',
}: PlayPageTitleProps) => (
  <div
    className={cn(PLAY_SCROLL.root, className)}
    style={game ? ({ '--scroll-tone': `var(--play-${game})` } as CSSProperties) : undefined}
  >
    <div className={PLAY_SCROLL.ribbon}>
      <RibbonTail side="left" />
      <RibbonTail side="right" />
      <div className={PLAY_SCROLL.plate}>
        <Heading className={PLAY_SCROLL.title}>{children}</Heading>
      </div>
    </div>
    {body !== undefined && <div className={PLAY_SCROLL.box}>{body}</div>}
  </div>
)
