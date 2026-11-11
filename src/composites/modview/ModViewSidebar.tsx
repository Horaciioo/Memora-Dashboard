'use client'

import { useRef, useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import Link from '@/components/elements/navigation/AppLink'
import { PanelButton } from '@/composites/modview/SidebarPanelButton'
import { CommunityList } from '@/composites/modview/CommunityList'
import { LiveReinforcementEditor } from '@/composites/lives/coordination/LiveReinforcementEditor'
import { LeaveModViewButton } from '@/composites/modview/LeaveModViewButton'
import { EndLiveButton } from '@/composites/modview/EndLiveButton'
import { TeamChatEntry } from '@/composites/modview/TeamChatEntry'
import { TeamPanel } from '@/composites/modview/TeamPanel'
import type { TeamTools } from '@/composites/modview/memberMenu'
import type { MentionSeats } from '@/core/lib/lives/teamChat'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { MODVIEW_COPY, MODVIEW_UNBAN_COPY } from '@/declarations/modview/copy'
import { TEAM_CHAT_COPY, TEAM_CHAT_ENABLED } from '@/declarations/lives/teamChat'
import { TEAM_ROLES } from '@/declarations/modview/roles'
import type { TeamRole } from '@/declarations/modview/roles'
import { MODVIEW_TEAM_COPY } from '@/declarations/modview/watch'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_SIDEBAR, MODVIEW_TEAM_CHAT } from '@/declarations/ui/variants'
import type { LiveFocusView, ModViewCreator } from '@/types/lives'
import type { Chatter, ModViewState, UnbanRequest } from '@/types/modview'
import { cn } from '@/utils/classnames'

export interface ModViewSidebarProps {
  // Opens the settings box
  onSettings: () => void
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
    chat: { viewerId: string; seats: MentionSeats; isLocked?: boolean }
  }
  // Live left through the exit, which asks whether they stop moderating
  leaveLiveId?: string
  // Live the responsables may close from here
  endLiveId?: string
  // Unban requests, opened from their glyph, Twitch only
  unban?: {
    requests: UnbanRequest[]
    onOpen: (requestId: string | null) => void
    // Puts the desk away, the Mod View comes back
    onClose: () => void
  }
  // Creator whose live it is, shown at the top
  creator?: { name: string; avatar: string | null }
  // Other creator workspaces
  creators?: ModViewCreator[]
  // Moderator signed in, shown at the bottom
  viewer?: { name: string; avatar: string | null }
  // Chat audience, opened from its glyph
  audience: { community: ModViewState['community']; onPick: (chatter: Chatter) => void }
}

type SidebarPanel = 'team' | 'chat' | 'community' | 'unban'

// Channel team stays out
const HIDDEN_GROUPS: (keyof ModViewState['community'])[] = ['broadcaster', 'moderators']

/**
 * Icons on the left of the Mod View: the way out, the team, and the settings
 * @param {ModViewSidebarProps} props - Sidebar props
 * @return {JSX.Element}
 */

export const ModViewSidebar = ({
  onSettings,
  team,
  leaveLiveId,
  endLiveId,
  creator,
  creators = [],
  viewer,
  unban,
  audience,
}: ModViewSidebarProps) => {
  const [open, setOpen] = useState<SidebarPanel | null>(null)
  const [isCreatorPickerOpen, setCreatorPickerOpen] = useState(false)
  // Drawer lives out of the panels: a click in it must not count as outside
  const [isReinforcing, setReinforcing] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const ExitIcon = ICONS.signOut
  const UnbanIcon = ICONS.unbanRequest
  const SettingsIcon = ICONS.settings

  useOutsideDismiss(open !== null, rootRef, () => setOpen(null))

  // Another glyph puts the unban desk away
  const toggle = (panel: SidebarPanel) => {
    unban?.onClose()
    setOpen(open === panel ? null : panel)
  }

  return (
    <nav ref={rootRef} className={MODVIEW_SIDEBAR.root} aria-label={MODVIEW_COPY.sidebar}>
      <div className={MODVIEW_SIDEBAR.stack}>
        {creator && (
          <div className={MODVIEW_SIDEBAR.creatorPicker}>
            <button
              type="button"
              className={MODVIEW_SIDEBAR.creatorButton}
              aria-label={creator.name}
              aria-expanded={creators.length > 1 ? isCreatorPickerOpen : undefined}
              onClick={() => creators.length > 1 && setCreatorPickerOpen((value) => !value)}
            >
              <Avatar name={creator.name} src={creator.avatar} size="md" />
            </button>
            {isCreatorPickerOpen && (
              <div className={MODVIEW_SIDEBAR.creatorChoices}>
                {creators.map((entry) =>
                  entry.liveId ? (
                    <Link
                      key={entry.id}
                      href={ROUTES.live(entry.liveId)}
                      className={cn(
                        MODVIEW_SIDEBAR.creatorChoice,
                        !entry.isActive && MODVIEW_SIDEBAR.creatorChoiceInactive
                      )}
                      aria-label={entry.name}
                    >
                      <Avatar name={entry.name} src={entry.avatar} size="md" />
                    </Link>
                  ) : (
                    <span
                      key={entry.id}
                      className={cn(
                        MODVIEW_SIDEBAR.creatorChoice,
                        MODVIEW_SIDEBAR.creatorChoiceInactive
                      )}
                      title={entry.name}
                    >
                      <Avatar name={entry.name} src={entry.avatar} size="md" />
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {unban && (
          <button
            type="button"
            className={MODVIEW_SIDEBAR.button}
            aria-label={MODVIEW_UNBAN_COPY.title}
            title={MODVIEW_UNBAN_COPY.title}
            onClick={() => {
              setOpen(null)
              unban.onOpen(null)
            }}
          >
            <UnbanIcon className={MODVIEW_SIDEBAR.icon} aria-hidden="true" />
          </button>
        )}

        {endLiveId && <EndLiveButton liveId={endLiveId} />}
      </div>

      <div className={MODVIEW_SIDEBAR.stack}>
        {team && (
          <PanelButton
            icon="sword"
            tone={team.viewerRole ? TEAM_ROLES[team.viewerRole].glyph : undefined}
            label={MODVIEW_TEAM_COPY.title}
            isWide
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

        {TEAM_CHAT_ENABLED && team && (
          <TeamChatEntry
            liveId={team.liveId}
            viewerId={team.chat.viewerId}
            seats={team.chat.seats}
            isLocked={team.chat.isLocked}
            isOpen={open === 'chat'}
            onToggle={() => toggle('chat')}
          />
        )}

        {TEAM_CHAT_ENABLED && !team && !leaveLiveId && (
          <PanelButton
            icon="teamChat"
            label={TEAM_CHAT_COPY.title}
            isOpen={open === 'chat'}
            onToggle={() => toggle('chat')}
            anchor="top"
            isWide
          >
            <div className={MODVIEW_TEAM_CHAT.box}>
              <p className={MODVIEW_TEAM_CHAT.empty}>{TEAM_CHAT_COPY.offline}</p>
            </div>
          </PanelButton>
        )}

        <PanelButton
          icon="crowd"
          label={MODVIEW_COPY.community}
          isWide
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
      </div>

      <div className={MODVIEW_SIDEBAR.stack}>
        <button
          type="button"
          className={MODVIEW_SIDEBAR.button}
          aria-label={MODVIEW_COPY.settings}
          title={MODVIEW_COPY.settings}
          onClick={onSettings}
        >
          <SettingsIcon className={MODVIEW_SIDEBAR.icon} aria-hidden="true" />
        </button>

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

        {viewer && (
          <span className={MODVIEW_SIDEBAR.creator} title={viewer.name}>
            <Avatar name={viewer.name} src={viewer.avatar} size="md" />
          </span>
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
