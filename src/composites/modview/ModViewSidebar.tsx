'use client'

import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import Link from '@/components/elements/navigation/AppLink'
import { PageOptionsList } from '@/components/structures/page/PageOptionsList'
import type { PageOption } from '@/components/structures/page/PageOptions'
import { EndLiveButton } from '@/composites/modview/EndLiveButton'
import { TeamPanel } from '@/composites/modview/TeamPanel'
import type { TeamTools } from '@/composites/modview/memberMenu'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/useOutsideDismiss'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_TEAM_COPY } from '@/declarations/modview/watch'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_SIDEBAR } from '@/declarations/ui/variants'
import type { LiveFocusView } from '@/types/lives'
import { cn } from '@/utils/classnames'

export interface ModViewSidebarProps {
  // Window switches and gestures of the settings
  options: PageOption[]
  // Teammates to follow, for the seats that may
  team?: { tools: TeamTools; focuses: LiveFocusView[] }
  // Live the responsables may close from here
  endLiveId?: string
}

type SidebarPanel = 'team' | 'settings'

interface PanelButtonProps {
  icon: IconName
  label: string
  isOpen: boolean
  onToggle: () => void
  // Where the panel hangs
  anchor: 'top' | 'bottom'
  children: ReactNode
}

/**
 * Icon that opens a panel on its right
 * @param {PanelButtonProps} props - Button props
 * @return {JSX.Element}
 */

const PanelButton = ({ icon, label, isOpen, onToggle, anchor, children }: PanelButtonProps) => {
  const Icon = ICONS[icon]

  return (
    <div className={MODVIEW_SIDEBAR.group}>
      <button
        type="button"
        className={cn(MODVIEW_SIDEBAR.button, isOpen && MODVIEW_SIDEBAR.buttonOpen)}
        aria-label={label}
        title={label}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <Icon className={MODVIEW_SIDEBAR.icon} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="group"
          aria-label={label}
          className={cn(
            MODVIEW_SIDEBAR.panel,
            anchor === 'top' ? MODVIEW_SIDEBAR.panelTop : MODVIEW_SIDEBAR.panelBottom
          )}
        >
          <p className={MODVIEW_SIDEBAR.title}>{label}</p>
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * Icons on the left of the Mod View: the way out, the team, and the settings
 * @param {ModViewSidebarProps} props - Sidebar props
 * @return {JSX.Element}
 */

export const ModViewSidebar = ({ options, team, endLiveId }: ModViewSidebarProps) => {
  const [open, setOpen] = useState<SidebarPanel | null>(null)
  const rootRef = useRef<HTMLElement>(null)
  const ExitIcon = ICONS.signOut

  useOutsideDismiss(open !== null, rootRef, () => setOpen(null))

  const toggle = (panel: SidebarPanel) => setOpen(open === panel ? null : panel)

  return (
    <nav ref={rootRef} className={MODVIEW_SIDEBAR.root} aria-label={MODVIEW_COPY.sidebar}>
      <div className={MODVIEW_SIDEBAR.stack}>
        <Link
          href={ROUTES.dashboard}
          className={MODVIEW_SIDEBAR.button}
          aria-label={MODVIEW_COPY.back}
          title={MODVIEW_COPY.back}
        >
          <ExitIcon className={MODVIEW_SIDEBAR.icon} aria-hidden="true" />
        </Link>

        {team && (
          <PanelButton
            icon="teams"
            label={MODVIEW_TEAM_COPY.title}
            isOpen={open === 'team'}
            onToggle={() => toggle('team')}
            anchor="top"
          >
            <TeamPanel tools={team.tools} focuses={team.focuses} />
          </PanelButton>
        )}

        {endLiveId && <EndLiveButton liveId={endLiveId} />}
      </div>

      <PanelButton
        icon="settings"
        label={MODVIEW_COPY.settings}
        isOpen={open === 'settings'}
        onToggle={() => toggle('settings')}
        anchor="bottom"
      >
        <p className={MODVIEW_SIDEBAR.subtitle}>{PAGE_OPTIONS_COPY.title}</p>
        <PageOptionsList options={options} onDone={() => setOpen(null)} />
      </PanelButton>
    </nav>
  )
}
