'use client'

import { useRef, useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import Link from '@/components/elements/navigation/AppLink'
import { PageOptionsList } from '@/components/structures/page/PageOptionsList'
import type { PageOption } from '@/components/structures/page/PageOptions'
import { PanelButton } from '@/composites/modview/SidebarPanelButton'
import { CommunityList } from '@/composites/modview/CommunityList'
import { LiveReinforcementEditor } from '@/composites/lives/LiveReinforcementEditor'
import { LeaveModViewButton } from '@/composites/modview/LeaveModViewButton'
import { EndLiveButton } from '@/composites/modview/EndLiveButton'
import { TeamChatEntry } from '@/composites/modview/TeamChatEntry'
import { TeamPanel } from '@/composites/modview/TeamPanel'
import type { TeamTools } from '@/composites/modview/memberMenu'
import type { MentionSeats } from '@/core/lib/lives/teamChat'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/useOutsideDismiss'
import { UnbanQueue } from '@/composites/modview/UnbanQueue'
import { MODVIEW_COPY, MODVIEW_UNBAN_COPY } from '@/declarations/modview/copy'
import { TEAM_ROLES } from '@/declarations/modview/roles'
import type { TeamRole } from '@/declarations/modview/roles'
import { MODVIEW_TEAM_COPY } from '@/declarations/modview/watch'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_SIDEBAR, MODVIEW_UNBAN } from '@/declarations/ui/variants'
import type { LiveFocusView } from '@/types/lives'
import type { Chatter, ModViewState, UnbanRequest } from '@/types/modview'
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
    // Seat the viewer holds, tints the glyph
    viewerRole: TeamRole | null
    canReinforce: boolean
    // Internal chat, kept off outside a real live
    chat: { viewerId: string; seats: MentionSeats }
  }
  // Live left through the exit, which asks whether they stop moderating
  leaveLiveId?: string
  // Live the responsables may close from here
  endLiveId?: string
  // Unban requests, opened from their glyph, Twitch only
  unban?: { requests: UnbanRequest[]; onOpen: (requestId: string | null) => void }
  // Creator whose live it is, shown at the top
  creator?: { name: string; avatar: string | null }
  // Chat audience, opened from its glyph
  audience: { community: ModViewState['community']; onPick: (chatter: Chatter) => void }
}

type SidebarPanel = 'team' | 'chat' | 'community' | 'unban' | 'settings'

// Channel team stays out
const HIDDEN_GROUPS: (keyof ModViewState['community'])[] = ['broadcaster', 'moderators']

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
  creator,
  unban,
  audience,
}: ModViewSidebarProps) => {
  const [open, setOpen] = useState<SidebarPanel | null>(null)
  // Drawer lives out of the panels: a click in it must not count as outside
  const [isReinforcing, setReinforcing] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const ExitIcon = ICONS.signOut
  const MaximizeIcon = ICONS.maximize

  useOutsideDismiss(open !== null, rootRef, () => setOpen(null))

  const toggle = (panel: SidebarPanel) => setOpen(open === panel ? null : panel)

  return (
    <nav ref={rootRef} className={MODVIEW_SIDEBAR.root} aria-label={MODVIEW_COPY.sidebar}>
      <div className={MODVIEW_SIDEBAR.stack}>
        {creator && (
          <>
            <span className={MODVIEW_SIDEBAR.creator} title={creator.name}>
              <Avatar name={creator.name} src={creator.avatar} size="md" />
            </span>
            <div className={MODVIEW_SIDEBAR.divider} role="separator" />
          </>
        )}

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

        <div className={MODVIEW_SIDEBAR.divider} role="separator" />
        <PanelButton
          icon="crowd"
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

        {unban && <div className={MODVIEW_SIDEBAR.divider} role="separator" />}

        {unban && (
          <PanelButton
            icon="unbanRequest"
            label={MODVIEW_UNBAN_COPY.title}
            isOpen={open === 'unban'}
            onToggle={() => toggle('unban')}
            anchor="top"
            isWide
            action={
              <button
                type="button"
                className={MODVIEW_UNBAN.iconButton}
                aria-label={MODVIEW_UNBAN_COPY.expand}
                title={MODVIEW_UNBAN_COPY.expand}
                onClick={() => {
                  setOpen(null)
                  unban.onOpen(null)
                }}
              >
                <MaximizeIcon className={MODVIEW_UNBAN.icon} aria-hidden="true" />
              </button>
            }
          >
            <UnbanQueue
              requests={unban.requests}
              onSelect={(request) => {
                setOpen(null)
                unban.onOpen(request.id)
              }}
            />
          </PanelButton>
        )}

        {team && <div className={MODVIEW_SIDEBAR.divider} role="separator" />}

        {team && (
          <PanelButton
            icon="sword"
            tone={team.viewerRole ? TEAM_ROLES[team.viewerRole].tone : undefined}
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

        {team && (
          <TeamChatEntry
            liveId={team.liveId}
            viewerId={team.chat.viewerId}
            seats={team.chat.seats}
            isOpen={open === 'chat'}
            onToggle={() => toggle('chat')}
          />
        )}

        <div className={MODVIEW_SIDEBAR.divider} role="separator" />
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
