import { NAVIGATION_VIEW_REGISTRY } from '@/declarations/access/views'
import type { NavigationViewName } from '@/declarations/navigation'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { TONE_VARS } from '@/declarations/ui/theme'
import type { CSSProperties, ReactNode } from 'react'

export interface ConsoleBannerProps {
  view: NavigationViewName
  title: string
  lead: string
  aside?: ReactNode
}

/**
 * View banner
 * @param {NavigationViewName} view - View the console belongs to
 * @param {string} title - Banner title
 * @param {string} lead - Supporting line
 * @param {ReactNode} [aside] - Controls pinned to the right
 * @return {JSX.Element}
 */

export const ConsoleBanner = ({ view, title, lead, aside }: ConsoleBannerProps) => {
  const meta = NAVIGATION_VIEW_REGISTRY.get(view)
  const Icon = ICONS[meta.icon]

  return (
    <div
      className={CONSOLE_BLOCK.banner}
      style={{ '--view': TONE_VARS[meta.tone] } as CSSProperties}
    >
      <span className={CONSOLE_BLOCK.bannerGlyph}>
        <Icon className={CONSOLE_BLOCK.bannerIcon} aria-hidden="true" />
      </span>
      <span className={CONSOLE_BLOCK.bannerBody}>
        <span className={CONSOLE_BLOCK.bannerTitle}>{title}</span>
        <span className={CONSOLE_BLOCK.bannerLead}>{lead}</span>
      </span>
      {aside}
    </div>
  )
}
