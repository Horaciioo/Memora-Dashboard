'use client'

import { ModSettings } from '@/composites/modview/actions/ModSettings'
import { useEffect, useMemo, useState } from 'react'

import type { PageOption } from '@/components/structures/page/PageOptions'
import { AutoModWindow } from '@/composites/modview/AutoModWindow'
import { ChatWindow } from '@/composites/modview/ChatWindow'
import { CommunityWindow } from '@/composites/modview/CommunityWindow'
import { FocusBanner } from '@/composites/modview/FocusBanner'
import { InspectWindow } from '@/composites/modview/InspectWindow'
import type { TeamTools } from '@/composites/modview/memberMenu'
import { ModActionsWindow } from '@/composites/modview/ModActionsWindow'
import { PollDeniedDialog } from '@/composites/modview/PollDeniedDialog'
import { PollDialog } from '@/composites/modview/PollDialog'
import { MobileModView } from '@/composites/modview/mobile/MobileModView'
import { ModViewSidebar } from '@/composites/modview/ModViewSidebar'
import { SanctionsDrawer } from '@/composites/modview/SanctionsDrawer'
import { StreamWindow } from '@/composites/modview/StreamWindow'
import { UnbanDesk } from '@/composites/modview/UnbanDesk'
import { ViewerCard } from '@/composites/modview/ViewerCard'
import { ModWorkspace } from '@/composites/modview/workspace/ModWorkspace'
import { useLiveFocus } from '@/core/hooks/data/lives/useLiveFocus'
import { SplitHandle } from '@/composites/modview/workspace/SplitHandle'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { useSideWidth } from '@/core/hooks/interaction/layout/rail/useSideWidth'
import { useBareShell } from '@/core/hooks/interaction/layout/useBareShell'
import { useModPreferenceProfile } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { useModLayout } from '@/core/hooks/interaction/layout/useModLayout'
import { recentChatters } from '@/core/lib/modview/compose'
import { useModViewActions } from '@/core/hooks/interaction/state/moderation/useModViewActions'
import { useSuggestions } from '@/core/hooks/interaction/state/moderation/useSuggestions'
import { useWatchlist } from '@/core/hooks/interaction/state/moderation/useWatchlist'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { colourLookup } from '@/core/lib/modview/chatterColours'
import { windowsOf } from '@/core/lib/modview/gate'
import { sanctionsOn } from '@/core/lib/modview/viewer'
import { profileOfPermissions } from '@/core/lib/modview/profile'
import type { Suggestion } from '@/core/lib/modview/suggest'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_WORKSPACE_COPY } from '@/declarations/modview/workspace'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { roleOf } from '@/declarations/modview/roles'
import { MODVIEW_WINDOWS } from '@/declarations/modview/registries'
import type { ModViewProfileName } from '@/declarations/modview/profiles'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_FRAME, MODVIEW_SPOTLIGHT, MODVIEW_WORKSPACE } from '@/declarations/ui/variants'
import type { LivePerson, ModViewCreator } from '@/types/lives'
import type {
  ActContext,
  ModViewDriver,
  ModAct,
  ModViewIntent,
  ModViewWindow,
} from '@/types/modview'
import type { SanctionPanelView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'
import { LivePlatforms } from '@/utils/constants/lives'
import { SanctionKinds } from '@/utils/constants/moderation'
import { twitchViewerCardUrl } from '@/utils/format/modview'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

// Room the viewer card takes in the right column, wide enough for its tabs and its messages
const CARD_MIN_WIDTH = 384

// Time the card takes to grow or shrink, as its width transition
const CARD_TRANSITION_MS = 300

// Panel measure a gesture carries out
const SUGGESTED_KIND: Partial<Record<ModViewIntent['kind'], string>> = {
  warn: SanctionKinds.Warn,
  timeout: SanctionKinds.Timeout,
  ban: SanctionKinds.Ban,
}

/**
 * What a real live adds to the Mod View: history, team, Inspect Mod, Focus
 * @typedef {Object} ModViewLiveTools
 * @property {string} id - Live identifier
 * @property {string} viewerId - Signed-in member
 * @property {LivePerson[]} members - Convened team
 * @property {string[]} focusable - Members the viewer may follow
 * @property {string[]} coordinatorIds - Members coordinating right now
 * @property {boolean} [canEnd] - Viewer may close the live
 * @property {PanelMemory} initialMemory - Rungs already applied to the creator's viewers
 */

export interface ModViewLiveTools {
  id: string
  viewerId: string
  members: LivePerson[]
  focusable: string[]
  coordinatorIds: string[]
  // Viewer may close the live
  canEnd?: boolean
  // Junior seat, locks say nothing
  isJunior?: boolean
  initialMemory: PanelMemory
}

export interface ModViewProps {
  driver: ModViewDriver
  // Everything shown, nothing playable: no live on air
  watchOnly?: boolean
  permissions: PermissionName[]
  panel: SanctionPanelView | null
  levelName: string | null
  levelIcon?: IconName | null
  // Inside a course: no bar, sanctions folded away
  embedded?: boolean
  // Shown off on a page: no bar
  showcase?: boolean
  // Windows kept
  only?: ModViewWindow[]
  // A real live
  live?: ModViewLiveTools
  // Other creator workspaces
  creators?: ModViewCreator[]
  // Seat the arrangement is made for, read from the permissions when absent
  profile?: ModViewProfileName
  // Brings the live instructions back
  onReread?: (() => void) | null
}

/**
 * Moderator view of one live
 * @param {ModViewProps} props - Mod View props
 * @return {JSX.Element}
 */

export const ModView = ({
  driver: liveDriver,
  watchOnly = false,
  permissions,
  panel,
  levelName,
  levelIcon = null,
  embedded = false,
  showcase = false,
  only,
  live,
  creators,
  profile,
  onReread,
}: ModViewProps) => {
  const driver = useMemo(
    () =>
      watchOnly
        ? {
            ...liveDriver,
            state: { ...liveDriver.state, readOnly: true, notice: MODVIEW_COPY.watchOnly },
          }
        : liveDriver,
    [liveDriver, watchOnly]
  )
  const { state, spotlight } = driver
  const isWorkspace = !embedded && !showcase && !only
  const side = useSideWidth()
  const isMobile = useIsMobileShell()
  const [inspected, setInspected] = useState<string | null>(null)
  const [actInPlace, setActInPlace] = useState(false)
  const [isSettingsOpen, setSettingsOpen] = useState(false)
  // Unban requests desk filling the stage, with the request opened first
  const [unbanDesk, setUnbanDesk] = useState<{ initialId: string | null } | null>(null)
  const focus = useLiveFocus(live?.id ?? null)
  useModPreferenceProfile(live?.id ?? null)
  const following = live
    ? focus.focuses.find((entry) => entry.watcherId === live.viewerId)
    : undefined

  const actions = useModViewActions({
    driver,
    permissions,
    initialMemory: live?.initialMemory ?? {},
    onBehalfOfId: following && actInPlace ? following.targetId : null,
    quiet: live?.isJunior,
  })
  const { gate, picked, setPicked, memory } = actions
  const watchlist = useWatchlist(state.messages)
  // Speakers first, then the rest of the room
  const candidates = useMemo(() => {
    const { moderators, vips, viewers } = state.community
    const all = [...recentChatters(state.messages), ...viewers, ...vips, ...moderators]

    return all.filter((one, index) => all.findIndex((other) => other.id === one.id) === index)
  }, [state.messages, state.community])
  const { suggestions, dismiss } = useSuggestions(state, panel, memory, actions.acted)

  // A sanction by hand counts on the rung the viewer's suggestion stood for
  const act = (intent: ModViewIntent, context: ActContext = {}) => {
    const chatterId = 'chatterId' in intent ? intent.chatterId : null
    const kind = SUGGESTED_KIND[intent.kind]
    const fit =
      context.offenseId === undefined && chatterId && kind
        ? suggestions.find(
            (item) =>
              item.source.chatter.id === chatterId &&
              item.offense &&
              item.rung !== null &&
              item.measure?.kind === kind
          )
        : undefined

    actions.act(
      intent,
      fit?.offense && fit.rung !== null
        ? { ...context, offenseId: fit.offense.id, rung: fit.rung }
        : context
    )
  }

  // Windows this platform and seat can open
  const seat = profile ?? profileOfPermissions(permissions)
  const canInspect = permissions.includes(Permissions.LiveInspect)
  const canFocus = permissions.includes(Permissions.LiveFocus)
  // Inspect Mod only opens on a real live, for the seats holding the right
  const available = useMemo(
    () =>
      windowsOf(state.platform).filter(
        (id) =>
          (id !== 'inspect' || (live !== undefined && canInspect)) &&
          // The audience is a sidebar glyph on the page
          (id !== 'community' || !isWorkspace) &&
          // The queue is Twitch's, the watch list lives in the sanctions panel
          (id !== 'automod' || !isWorkspace || state.platform === LivePlatforms.Twitch)
      ),
    [state.platform, live, canInspect, isWorkspace]
  )
  const model = useModLayout(seat, available)
  useBareShell(isWorkspace)

  // Every seat sees the team, the gestures follow the rights
  const team: TeamTools | undefined = live
    ? {
        members: live.members.filter((member) => member.id !== live.viewerId),
        canInspect,
        hasFocusRight: canFocus && !watchOnly,
        canFocus: (accountId) => !watchOnly && canFocus && live.focusable.includes(accountId),
        followingId: following?.targetId ?? null,
        onFocus: (accountId) => void focus.start(accountId),
        onStopFocus: () => {
          setActInPlace(false)
          void focus.stop()
        },
        onInspect: (accountId) => {
          setInspected(accountId)
          if (!model.isShown('inspect')) model.toggleHidden('inspect')
        },
      }
    : undefined

  const lit = (target: string) => spotlight === target
  // Act target, in chat or not
  const pickByAct = (act: ModAct) => {
    if (!act.target) return
    const found = actions.findChatter(act.target)
    if (found) return setPicked(found)
    if (!act.targetId) return

    // Gone from the chat, rebuilt from the act
    setPicked({
      id: act.targetId,
      login: act.target.toLowerCase(),
      name: act.target,
      colour: null,
      badges: [],
    })
  }

  // The panel line a suggestion stands for
  const useSuggestion = (suggestion: Suggestion) => {
    if (!suggestion.command) return
    actions.useLine(
      suggestion.command,
      suggestion.offense && suggestion.rung !== null
        ? {
            chatterId: suggestion.source.chatter.id,
            offenseId: suggestion.offense.id,
            rung: suggestion.rung,
          }
        : undefined
    )
  }

  const colourOf = useMemo(
    () => colourLookup(state.messages, state.community),
    [state.messages, state.community]
  )

  const windowFor = (id: ModViewWindow) => {
    switch (id) {
      case 'stream':
        return <StreamWindow state={state} isLit={lit('stream')} isTitleLit={lit('title')} />
      case 'modActions':
        return (
          <ModActionsWindow
            acts={state.acts}
            isLit={lit('modActions')}
            onPickTarget={pickByAct}
            colourOf={colourOf}
            focusLogin={following?.targetLogin ?? null}
            team={team}
          />
        )
      case 'automod':
        return (
          <AutoModWindow
            held={state.held}
            messages={state.messages}
            acts={state.acts}
            isLit={lit('automod')}
            gate={gate}
            onAct={act}
            hasQueue={state.platform === LivePlatforms.Twitch}
            hasWatch={!isWorkspace}
            watchlist={watchlist}
            onPick={setPicked}
            colourOf={colourOf}
          />
        )
      case 'chat':
        return (
          <ChatWindow
            state={state}
            spotlight={spotlight}
            gate={gate}
            onAct={act}
            onPick={setPicked}
            onWatch={watchlist.watch}
            draft={actions.draft}
            onDraft={actions.writeDraft}
            onSend={actions.send}
            hint={actions.hint}
            hasTerms={isWorkspace}
            liveId={live?.id ?? null}
            onSettings={() => setSettingsOpen(true)}
          />
        )
      case 'community':
        return (
          <CommunityWindow community={state.community} spotlight={spotlight} onPick={setPicked} />
        )
      case 'inspect':
        return live ? (
          <InspectWindow
            liveId={live.id}
            viewerId={live.viewerId}
            members={live.members}
            inspected={inspected}
            onInspect={setInspected}
            history={{
              state,
              panel,
              memory,
              liveId: live.id,
              onPick: setPicked,
              onPrefill: actions.prefill,
            }}
          />
        ) : null
    }
  }

  // The card grows from the column it replaces and shrinks back, so the chat never jumps
  const [shownCard, setShownCard] = useState(picked)
  const [isCardGrown, setCardGrown] = useState(false)
  useEffect(() => {
    if (picked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShownCard(picked)
      // One frame at the column's width, then the card takes its own
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setCardGrown(true)))

      return () => cancelAnimationFrame(frame)
    }

    setCardGrown(false)
    const timer = setTimeout(() => setShownCard(null), CARD_TRANSITION_MS)

    return () => clearTimeout(timer)
  }, [picked])

  const pickedLines = shownCard
    ? state.messages.filter((message) => message.author.id === shownCard.id)
    : []

  // One switch per window in the page options
  const pageOptions: PageOption[] = [
    ...available.map((id) => ({
      id,
      label:
        id === 'automod' && state.platform !== LivePlatforms.Twitch
          ? MODVIEW_WATCH_COPY.watch
          : MODVIEW_WINDOWS.label(id),
      checked: model.isShown(id),
      onChange: () => model.toggleHidden(id),
    })),
    { id: 'reset', label: MODVIEW_WORKSPACE_COPY.reset, onSelect: model.reset },
    ...(driver.reload
      ? [{ id: 'reload', label: MODVIEW_COPY.reload, onSelect: driver.reload }]
      : []),
    ...(onReread ? [{ id: 'reread', label: LIVE_PAGE_COPY.reread, onSelect: onReread }] : []),
  ]

  // Legacy grid of the courses and showcases
  const shows = (id: ModViewWindow) =>
    windowsOf(state.platform).includes(id) && (!only || only.includes(id))

  const grid = (ids: ModViewWindow[]) => ids.filter(shows).map((id) => windowFor(id))

  const viewerCard = shownCard ? (
    <ViewerCard
      key={shownCard.id}
      chatter={shownCard}
      messages={pickedLines}
      liveSanctions={sanctionsOn(state.acts, shownCard).length}
      gate={gate}
      onAct={act}
      isDocked={isWorkspace && !isMobile}
      width={
        isWorkspace && !isMobile
          ? isCardGrown
            ? Math.max(side.width, CARD_MIN_WIDTH)
            : side.width
          : undefined
      }
      onClose={() => setPicked(null)}
      twitchUrl={twitchViewerCardUrl(state.embedUrl, shownCard.login)}
      isWatched={watchlist.watched.some((entry) => entry.id === shownCard.id)}
      onWatch={() =>
        watchlist.watched.some((entry) => entry.id === shownCard.id)
          ? watchlist.unwatch(shownCard.id)
          : watchlist.watch(shownCard)
      }
      dossier={live ? { liveId: live.id, panel, memory, onPrefill: actions.prefill } : undefined}
    />
  ) : null

  if (isWorkspace && isMobile) {
    return (
      <>
        {actions.pollForm === 'create' && (
          <PollDialog onStart={(intent) => act(intent)} onClose={actions.closePollForm} />
        )}
        {actions.pollForm === 'denied' && <PollDeniedDialog onClose={actions.closePollForm} />}
        <MobileModView
          state={state}
          gate={gate}
          onAct={act}
          windows={available}
          render={windowFor}
          suggest={{
            suggestions,
            gate,
            onAct: act,
            onUse: useSuggestion,
            onPick: setPicked,
            onWatch: watchlist.watch,
            onDismiss: dismiss,
          }}
          viewerCard={viewerCard}
          options={pageOptions}
          team={
            team && live
              ? {
                  liveId: live.id,
                  viewerId: live.viewerId,
                  seats: {
                    members: live.members,
                    coordinatorIds: live.coordinatorIds,
                    designatedId: LIVE_SETTINGS.teamChatMentionAccountId,
                  },
                  isLocked: watchOnly,
                  tools: team,
                  focuses: focus.focuses,
                  coordinatorIds: live.coordinatorIds,
                  canReinforce: !watchOnly && permissions.includes(Permissions.LiveAnnounce),
                }
              : undefined
          }
          leaveLiveId={live?.id}
          endLiveId={live?.canEnd && !watchOnly ? live.id : undefined}
          isWatchOnly={watchOnly || !live}
        />
      </>
    )
  }

  return (
    <div
      className={cn(
        MODVIEW_FRAME.root,
        isWorkspace ? MODVIEW_FRAME.bleed : MODVIEW_FRAME.embedded,
        !isWorkspace && state.platform === LivePlatforms.Twitch && 'skin-twitch'
      )}
    >
      {isSettingsOpen && (
        <ModSettings options={pageOptions} onClose={() => setSettingsOpen(false)} />
      )}
      {actions.pollForm === 'create' && (
        <PollDialog onStart={(intent) => act(intent)} onClose={actions.closePollForm} />
      )}
      {actions.pollForm === 'denied' && <PollDeniedDialog onClose={actions.closePollForm} />}

      {isWorkspace && (
        <ModViewSidebar
          onSettings={() => setSettingsOpen(true)}
          team={
            team && live
              ? {
                  liveId: live.id,
                  tools: team,
                  focuses: focus.focuses,
                  coordinatorIds: live.coordinatorIds,
                  viewerRole: roleOf(
                    live.members.find((member) => member.id === live.viewerId)?.rank,
                    live.coordinatorIds.includes(live.viewerId)
                  ),
                  canReinforce: !watchOnly && permissions.includes(Permissions.LiveAnnounce),
                  chat: {
                    viewerId: live.viewerId,
                    isLocked: watchOnly,
                    seats: {
                      members: live.members,
                      coordinatorIds: live.coordinatorIds,
                      designatedId: LIVE_SETTINGS.teamChatMentionAccountId,
                    },
                  },
                }
              : undefined
          }
          leaveLiveId={live?.id}
          endLiveId={live?.canEnd && !watchOnly ? live.id : undefined}
          creator={{ name: state.channel.name, avatar: state.channel.avatar }}
          creators={creators}
          viewer={live?.members.find((member) => member.id === live.viewerId)}
          unban={
            state.platform === LivePlatforms.Twitch
              ? {
                  requests: state.unbanRequests,
                  onClose: () => setUnbanDesk(null),
                  // The glyph clicked again puts the desk away
                  onOpen: (requestId) =>
                    setUnbanDesk((current) =>
                      requestId === null && current ? null : { initialId: requestId }
                    ),
                }
              : undefined
          }
          audience={{ community: state.community, onPick: setPicked }}
        />
      )}

      <div className={MODVIEW_FRAME.body}>
        <div className={MODVIEW_SPOTLIGHT.stage}>
          {spotlight && <div className={MODVIEW_SPOTLIGHT.veil} aria-hidden="true" />}

          {following && (
            <FocusBanner
              name={following.targetName}
              actInPlace={actInPlace}
              onActInPlace={setActInPlace}
            />
          )}

          {isWorkspace ? (
            <ModWorkspace model={model} render={windowFor} />
          ) : (
            <div className={only ? MODVIEW_FRAME.focus : MODVIEW_FRAME.grid}>
              <div className={only ? MODVIEW_FRAME.flat : MODVIEW_FRAME.column}>
                {grid(['stream'])}
                <div className={only ? MODVIEW_FRAME.flat : MODVIEW_FRAME.pair}>
                  {grid(['modActions', 'automod'])}
                </div>
              </div>
              <div className={only ? MODVIEW_FRAME.flat : MODVIEW_FRAME.column}>
                {grid(['chat'])}
              </div>
              <div className={only ? MODVIEW_FRAME.flat : MODVIEW_FRAME.column}>
                {grid(['community'])}
              </div>
            </div>
          )}

          {!isWorkspace && viewerCard}

          {isWorkspace && unbanDesk && (
            <UnbanDesk
              requests={state.unbanRequests}
              initialId={unbanDesk.initialId}
              liveId={live?.id ?? null}
              messages={state.messages}
              gate={gate}
              onAct={act}
              onBack={() => setUnbanDesk(null)}
            />
          )}
        </div>

        {isWorkspace && !embedded && (
          <div className={MODVIEW_WORKSPACE.sideHandle}>
            <div className={MODVIEW_WORKSPACE.sideHandleGrip}>
              <SplitHandle
                orientation="vertical"
                label={MODVIEW_WORKSPACE_COPY.resizeSide}
                onMove={side.resize}
              />
            </div>
          </div>
        )}

        {isWorkspace && viewerCard}

        {!embedded && (
          <SanctionsDrawer
            panel={panel}
            isHidden={isWorkspace && shownCard !== null}
            width={isWorkspace ? side.width : undefined}
            levelName={levelName}
            levelIcon={levelIcon}
            target={picked}
            memory={memory}
            onPrefill={actions.prefill}
            chatters={candidates}
            watch={{ watchlist, gate, onAct: act, onPick: setPicked }}
            suggest={
              isWorkspace
                ? {
                    suggestions,
                    gate,
                    onAct: act,
                    onUse: useSuggestion,
                    onPick: setPicked,
                    onWatch: watchlist.watch,
                    onDismiss: dismiss,
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  )
}
