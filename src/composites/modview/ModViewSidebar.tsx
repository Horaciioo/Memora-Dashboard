'use client'

import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import Link from '@/components/elements/navigation/AppLink'
import { PageOptionsList } from '@/components/structures/page/PageOptionsList'
import type { PageOption } from '@/components/structures/page/PageOptions'
import { CommunityList } from '@/composites/modview/CommunityList'
import { LiveReinforcementEditor } from '@/composites/lives/LiveReinforcementEditor'
import { LeaveModViewButton } from '@/composites/modview/LeaveModViewButton'
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
import type { Chatter, ModViewState } from '@/types/modview'
import { cn } from '@/utils/classnames'

export interface ModViewSidebarProps {
  // Window switches and gestures of the settings
  options: PageOption[]
  // Teammates to follow, for the seats that may
  team?: {
    liveId: string
    tools: TeamTools
    focuses: LiveFocusView[]
    coordinatorIds: string[]
    canReinforce: boolean
  }
  // Live left through the exit, which asks whether they stop moderating
  leaveLiveId?: string
  // Live the responsables may close from here
  endLiveId?: string
  // Chat audience, opened from its glyph
  audience: { community: ModViewState['community']; onPick: (chatter: Chatter) => void }
}

type SidebarPanel = 'team' | 'community' | 'settings'

// Channel team stays out
const HIDDEN_GROUPS: (keyof ModViewState['community'])[] = ['broadcaster', 'moderators']

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

export const ModViewSidebar = ({
  options,
  team,
  leaveLiveId,
  endLiveId,
  audience,
}: ModViewSidebarProps) => {
  const [open, setOpen] = useState<SidebarPanel | null>(null)
  // Drawer lives out of the panels: a click in it must not count as outside
  const [isReinforcing, setReinforcing] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const ExitIcon = ICONS.signOut

  useOutsideDismiss(open !== null, rootRef, () => setOpen(null))

  const toggle = (panel: SidebarPanel) => setOpen(open === panel ? null : panel)

  return (
    <nav ref={rootRef} className={MODVIEW_SIDEBAR.root} aria-label={MODVIEW_COPY.sidebar}>
      <div className={MODVIEW_SIDEBAR.stack}>
        {leaveLiveId ? (
          <LeaveModViewButton liveId={leaveLiveId} />
        ) : (
          <Link
            href={ROUTES.dashboard}
            className={MODVIEW_SIDEBAR.button}
            aria-label={MODVIEW_COPY.back}
            title={MODVIEW_COPY.back}
          >
            <ExitIcon className={MODVIEW_SIDEBAR.icon} aria-hidden="true" />
          </Link>
        )}

        <PanelButton
          icon="viewer"
          label={MODVIEW_COPY.community}
          isOpen={open === 'community'}
          onToggle={() => toggle('community')}
          anchor="top"
        >
          <CommunityList
            community={audience.community}
            skip={HIDDEN_GROUPS}
            onPick={(chatter) => {
              setOpen(null)
              audience.onPick(chatter)
            }}
          />
        </PanelButton>

        {team && (
          <PanelButton
            icon="teams"
            label={MODVIEW_TEAM_COPY.title}
            isOpen={open === 'team'}
            onToggle={() => toggle('team')}
            anchor="top"
          >
            <TeamPanel
              liveId={team.liveId}
              tools={team.tools}
              focuses={team.focuses}
              coordinatorIds={team.coordinatorIds}
              canReinforce={team.canReinforce}
              onReinforce={() => {
                setOpen(null)
                setReinforcing(true)
              }}
            />
          </PanelButton>
        )}
      </div>

      <div className={MODVIEW_SIDEBAR.bottom}>
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
        {endLiveId && (
          <>
            <div className={MODVIEW_SIDEBAR.divider} role="separator" />
            <EndLiveButton liveId={endLiveId} />
          </>
        )}
      </div>
      {team && (
        <LiveReinforcementEditor
          liveId={team.liveId}
          open={isReinforcing}
          onClose={() => setReinforcing(false)}
        />
      )}
    </nav>
  )
}
