import { PLAY_HUB } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayPageTitleProps {
  children: string
  className?: string
}

/**
 * Arcade page title
 * @param {string} children - Title text
 * @return {JSX.Element}
 */

export const PlayPageTitle = ({ children, className }: PlayPageTitleProps) => (
  <h1 className={cn(PLAY_HUB.title, className)}>{children}</h1>
)
