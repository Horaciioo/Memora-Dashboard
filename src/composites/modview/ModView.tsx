'use client'

import { useMemo, useState } from 'react'

import type { PageOption } from '@/components/structures/page/PageOptions'
import { AutoModWindow } from '@/composites/modview/AutoModWindow'
import { ChatWindow } from '@/composites/modview/ChatWindow'
import { CommunityWindow } from '@/composites/modview/CommunityWindow'
import { FocusBanner } from '@/composites/modview/FocusBanner'
import { InspectCard } from '@/composites/modview/InspectCard'
import type { TeamTools } from '@/composites/modview/memberMenu'
import { ModActionsWindow } from '@/composites/modview/ModActionsWindow'
import { ModViewSidebar } from '@/composites/modview/ModViewSidebar'
import { SanctionsDrawer } from '@/composites/modview/SanctionsDrawer'
import { StreamWindow } from '@/composites/modview/StreamWindow'
import { UnbanRequestsWindow } from '@/composites/modview/UnbanRequestsWindow'
import { ViewerCard } from '@/composites/modview/ViewerCard'
import { ModWorkspace } from '@/composites/modview/workspace/ModWorkspace'
import { useLiveFocus } from '@/core/hooks/data/lives/useLiveFocus'
import { useBareShell } from '@/core/hooks/interaction/layout/useBareShell'
import { useModLayout } from '@/core/hooks/interaction/layout/useModLayout'
import { useModViewActions } from '@/core/hooks/interaction/state/useModViewActions'
import { useSuggestions } from '@/core/hooks/interaction/state/useSuggestions'
import { useWatchlist } from '@/core/hooks/interaction/state/useWatchlist'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { windowsOf } from '@/core/lib/modview/gate'
import { profileOfPermissions } from '@/core/lib/modview/profile'
import type { Suggestion } from '@/core/lib/modview/suggest'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { MODVIEW_WORKSPACE_COPY } from '@/declarations/modview/workspace'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { MODVIEW_WINDOWS } from '@/declarations/modview/registries'
import type { ModViewProfileName } from '@/declarations/modview/profiles'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_FRAME, MODVIEW_SPOTLIGHT } from '@/declarations/ui/variants'
import type { LivePerson } from '@/types/lives'
import type { ModViewDriver, ModViewWindow } from '@/types/modview'
import type { SanctionPanelView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'
import { LivePlatforms } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * What a real live adds to the Mod View: history, team, Inspect Mod, Focus
 * @typedef {Object} ModViewLiveTools
 * @property {string} id - Live identifier
 * @property {string} viewerId - Signed-in member
 * @property {LivePerson[]} members - Convened team
 * @property {string[]} focusable - Members the viewer may follow
 * @property {boolean} [canEnd] - Viewer may close the live
 * @property {PanelMemory} initialMemory - Rungs already applied to the creator's viewers
 */

export interface ModViewLiveTools {
  id: string
  viewerId: string
  members: LivePerson[]
  focusable: string[]
  // Viewer may close the live
  canEnd?: boolean
  initialMemory: PanelMemory
}

export interface ModViewProps {
  driver: ModViewDriver
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
  driver,
  permissions,
  panel,
  levelName,
  levelIcon = null,
  embedded = false,
  showcase = false,
  only,
  live,
  profile,
  onReread,
}: ModViewProps) => {
  const { state, spotlight } = driver
  const isWorkspace = !embedded && !showcase && !only
  const [isPanelOpen, setPanelOpen] = useState(true)
  const [inspected, setInspected] = useState<string | null>(null)
  const [actInPlace, setActInPlace] = useState(false)
  const focus = useLiveFocus(live?.id ?? null)
  const following = live
    ? focus.focuses.find((entry) => entry.watcherId === live.viewerId)
    : undefined

  const actions = useModViewActions({
    driver,
    permissions,
    initialMemory: live?.initialMemory ?? {},
    onBehalfOfId: following && actInPlace ? following.targetId : null,
  })
  const { gate, act, picked, setPicked, memory } = actions
  const watchlist = useWatchlist(state.messages)
  const { suggestions, dismiss } = useSuggestions(state, panel, memory)

  // Windows this platform and seat can open
  const seat = profile ?? profileOfPermissions(permissions)
  const available = useMemo(() => windowsOf(state.platform), [state.platform])
  const model = useModLayout(seat, available)
  useBareShell(isWorkspace)

  const canInspect = permissions.includes(Permissions.LiveInspect)
  const canFocus = permissions.includes(Permissions.LiveFocus)
  // Only seats that may follow or inspect see the team
  const team: TeamTools | undefined =
    live && (canInspect || canFocus)
      ? {
          members: live.members.filter((member) => member.id !== live.viewerId),
          canInspect,
          canFocus: (accountId) => canFocus && live.focusable.includes(accountId),
          followingId: following?.targetId ?? null,
          onFocus: (accountId) => void focus.start(accountId),
          onStopFocus: () => {
            setActInPlace(false)
            void focus.stop()
          },
          onInspect: setInspected,
        }
      : undefined

  const lit = (target: string) => spotlight === target
  const pickByName = (name: string) => {
    const found = actions.findChatter(name)
    if (found) setPicked(found)
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

  const windowFor = (id: ModViewWindow) => {
    switch (id) {
      case 'stream':
        return <StreamWindow state={state} isLit={lit('stream')} isTitleLit={lit('title')} />
      case 'modActions':
        return (
          <ModActionsWindow
            acts={state.acts}
            isLit={lit('modActions')}
            onPickTarget={pickByName}
            focusLogin={following?.targetLogin ?? null}
            team={team}
          />
        )
      case 'automod':
        return (
          <AutoModWindow
            held={state.held}
            isLit={lit('automod')}
            gate={gate}
            onAct={act}
            hasQueue={state.platform === LivePlatforms.Twitch}
            watchlist={watchlist}
            onPick={setPicked}
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
          />
        )
      case 'community':
        return (
          <CommunityWindow community={state.community} spotlight={spotlight} onPick={setPicked} />
        )
      case 'unbanRequests':
        return (
          <UnbanRequestsWindow
            requests={state.unbanRequests}
            isLit={lit('unbanRequests')}
            gate={gate}
            onAct={act}
          />
        )
    }
  }

  const pickedLines = picked
    ? state.messages.filter((message) => message.author.id === picked.id)
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
    ...(onReread ? [{ id: 'reread', label: LIVE_PAGE_COPY.reread, onSelect: onReread }] : []),
  ]

  // Legacy grid of the courses and showcases
  const shows = (id: ModViewWindow) =>
    windowsOf(state.platform).includes(id) && (!only || only.includes(id))

  const grid = (ids: ModViewWindow[]) => ids.filter(shows).map((id) => windowFor(id))

  return (
    <div
      className={cn(
        MODVIEW_FRAME.root,
        isWorkspace ? MODVIEW_FRAME.bleed : MODVIEW_FRAME.embedded,
        !isWorkspace && state.platform === LivePlatforms.Twitch && 'skin-twitch'
      )}
    >
      {isWorkspace && (
        <ModViewSidebar
          options={pageOptions}
          team={team ? { tools: team, focuses: focus.focuses } : undefined}
          endLiveId={live?.canEnd ? live.id : undefined}
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
              onStop={() => team?.onStopFocus()}
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
                {grid(['community', 'unbanRequests'])}
              </div>
            </div>
          )}

          {picked && (
            <ViewerCard
              chatter={picked}
              messages={pickedLines}
              gate={gate}
              onAct={act}
              onClose={() => setPicked(null)}
              isWatched={watchlist.watched.some((entry) => entry.id === picked.id)}
              onWatch={() =>
                watchlist.watched.some((entry) => entry.id === picked.id)
                  ? watchlist.unwatch(picked.id)
                  : watchlist.watch(picked)
              }
              dossier={
                live ? { liveId: live.id, panel, memory, onPrefill: actions.prefill } : undefined
              }
            />
          )}

          {live && inspected && (
            <InspectCard
              liveId={live.id}
              accountId={inspected}
              onClose={() => setInspected(null)}
            />
          )}
        </div>

        {!embedded && (
          <SanctionsDrawer
            panel={panel}
            levelName={levelName}
            levelIcon={levelIcon}
            isOpen={isPanelOpen}
            onToggle={() => setPanelOpen((open) => !open)}
            target={picked}
            memory={memory}
            recentIds={[
              ...new Set(Object.values(memory).flatMap((byOffense) => Object.keys(byOffense))),
            ]}
            onPrefill={actions.prefill}
            history={{
              state,
              liveId: live?.id ?? null,
              onPick: setPicked,
              onPrefill: actions.prefill,
            }}
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
