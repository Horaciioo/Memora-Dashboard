'use client'

import { useCallback, useMemo, useState } from 'react'

import { AutoModWindow } from '@/composites/modview/AutoModWindow'
import { ChatWindow } from '@/composites/modview/ChatWindow'
import { CommunityWindow } from '@/composites/modview/CommunityWindow'
import { FocusBanner } from '@/composites/modview/FocusBanner'
import { HistoryWindow } from '@/composites/modview/HistoryWindow'
import { InspectCard } from '@/composites/modview/InspectCard'
import { ModActionsWindow } from '@/composites/modview/ModActionsWindow'
import { SanctionsDrawer } from '@/composites/modview/SanctionsDrawer'
import { StreamWindow } from '@/composites/modview/StreamWindow'
import { UnbanRequestsWindow } from '@/composites/modview/UnbanRequestsWindow'
import { ViewerCard } from '@/composites/modview/ViewerCard'
import { ModViewRail } from '@/composites/modview/ModViewRail'
import { useLiveFocus } from '@/core/hooks/data/useLiveFocus'
import { parseChatCommand, rememberRung, writeRungCommand } from '@/core/lib/modview/commands'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { gateIntent, windowsOf } from '@/core/lib/modview/gate'
import { MODVIEW_COMMAND_COPY, MODVIEW_PANEL_COPY } from '@/declarations/modview/copy'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_FRAME, MODVIEW_SPOTLIGHT } from '@/declarations/ui/variants'
import type { LivePerson } from '@/types/lives'
import type {
  ActContext,
  Chatter,
  ModViewDriver,
  ModViewIntent,
  ModViewWindow,
} from '@/types/modview'
import type { SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'
import type { PermissionName } from '@/utils/constants/permissions'
import { SanctionKinds } from '@/utils/constants/moderation'
import { Permissions } from '@/utils/constants/permissions'

/**
 * What a real live adds to the Mod View: history, team, Inspect Mod, Focus
 * @typedef {Object} ModViewLiveTools
 * @property {string} id - Live identifier
 * @property {string} viewerId - Signed-in member
 * @property {LivePerson[]} members - Convened team
 * @property {string[]} focusable - Members the viewer may follow
 * @property {PanelMemory} initialMemory - Rungs already applied on this live
 */

export interface ModViewLiveTools {
  id: string
  viewerId: string
  members: LivePerson[]
  focusable: string[]
  initialMemory: PanelMemory
}

export interface ModViewProps {
  driver: ModViewDriver
  permissions: PermissionName[]
  panel: SanctionPanelView | null
  levelName: string | null
  levelIcon?: IconName | null
  // Inside a course: no rail taken, no page bleed, sanctions folded away
  embedded?: boolean
  // Shown off on a page: no rail taken
  showcase?: boolean
  // Windows kept
  only?: ModViewWindow[]
  // A real live
  live?: ModViewLiveTools
}

// Rung a prefilled line carries until it is sent
interface PendingRung {
  chatterId: string
  offenseId: string
  rung: number
}

/**
 * Moderator view of one live
 * @param {ModViewDriver} driver - Data source
 * @param {PermissionName[]} permissions - Held on this live
 * @param {SanctionPanelView | null} panel - Creator panel at the level in force
 * @param {string | null} levelName - Livecon level in force
 * @param {IconName | null} [levelIcon] - Glyph of that level
 * @param {boolean} [embedded] - Played inside a course
 * @param {boolean} [showcase] - Shown off on a page
 * @param {ModViewWindow[]} [only] - Windows kept
 * @param {ModViewLiveTools} [live] - Real live tools
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
}: ModViewProps) => {
  const { state, spotlight } = driver
  const [hidden, setHidden] = useState<Set<ModViewWindow>>(new Set())
  const [picked, setPicked] = useState<Chatter | null>(null)
  const [isPanelOpen, setPanelOpen] = useState(true)
  const [draft, setDraft] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingRung | null>(null)
  const [memory, setMemory] = useState<PanelMemory>(live?.initialMemory ?? {})
  const [inspected, setInspected] = useState<string | null>(null)
  const [actInPlace, setActInPlace] = useState(false)
  const focus = useLiveFocus(live?.id ?? null)

  const available = useMemo(() => windowsOf(state.platform), [state.platform])
  const following = live
    ? focus.focuses.find((entry) => entry.watcherId === live.viewerId)
    : undefined

  // Every chatter on screen
  const chatters = useMemo(() => {
    const known = new Map<string, Chatter>()
    for (const message of state.messages) known.set(message.author.id, message.author)
    for (const group of Object.values(state.community)) {
      for (const chatter of group) known.set(chatter.id, chatter)
    }

    return known
  }, [state.messages, state.community])

  const findChatter = useCallback(
    (name: string) =>
      [...chatters.values()].find(
        (chatter) =>
          chatter.login === name.toLowerCase() || chatter.name.toLowerCase() === name.toLowerCase()
      ) ?? null,
    [chatters]
  )

  const gate = useCallback(
    (intent: ModViewIntent) =>
      gateIntent(intent, {
        permissions,
        platform: state.platform,
        liveconLevel: state.liveconLevel,
        offline:
          state.connection === 'disconnected' ||
          state.connection === 'connecting' ||
          state.readOnly === true,
        offlineReason: state.notice,
      }),
    [
      permissions,
      state.platform,
      state.liveconLevel,
      state.connection,
      state.readOnly,
      state.notice,
    ]
  )

  // A refused gesture never reaches the driver
  const act = useCallback(
    (intent: ModViewIntent, context: ActContext = {}) => {
      if (!gate(intent).allowed) return

      const chatterId = 'chatterId' in intent ? intent.chatterId : null
      void driver.act(intent, {
        ...context,
        targetLogin:
          context.targetLogin ?? (chatterId ? chatters.get(chatterId)?.login : undefined),
        ...(following && actInPlace ? { onBehalfOfId: following.targetId } : {}),
      })
    },
    [driver, gate, chatters, following, actInPlace]
  )

  // The panel writes the line
  const prefill = (
    offense: SanctionOffenseCard,
    rung: number,
    chatter: Chatter | null = picked
  ) => {
    const step = offense.rungs[rung]
    if (!chatter || !step) return

    const text = writeRungCommand(step, chatter.login, offense.name)

    // A deletion has no command
    if (!text) {
      const lastLine = [...state.messages]
        .reverse()
        .find((message) => message.author.id === chatter.id && !message.deletedBy)
      const deletes = step.measures.some((measure) => measure.kind === SanctionKinds.Delete)

      if (deletes && lastLine) {
        act(
          { kind: 'delete', messageId: lastLine.id, chatterId: chatter.id },
          { offenseId: offense.id, rung, targetLogin: chatter.login }
        )
        setMemory((current) => rememberRung(current, chatter.id, offense.id, rung))
        setHint(null)
        return
      }

      setHint(MODVIEW_PANEL_COPY.noGesture)
      return
    }

    setPicked(chatter)
    setDraft(text)
    setHint(null)
    setPending({ chatterId: chatter.id, offenseId: offense.id, rung })
  }

  const send = (text: string) => {
    const parsed = parseChatCommand(text, findChatter)

    if (parsed.kind === 'error') {
      setHint(MODVIEW_COMMAND_COPY[parsed.reason])
      return
    }

    if (parsed.kind === 'say') {
      act({ kind: 'say', text: parsed.text })
    } else {
      const check = gate(parsed.intent)
      if (!check.allowed) {
        setHint(MODVIEW_COMMAND_COPY.refused.replace('{reason}', check.reason ?? ''))
        return
      }

      // The rung counts only for the viewer it was written for
      const fromPanel = pending?.chatterId === parsed.target.id ? pending : null
      act(parsed.intent, {
        targetLogin: parsed.target.login,
        ...(fromPanel ? { offenseId: fromPanel.offenseId, rung: fromPanel.rung } : {}),
      })
      if (fromPanel) {
        setMemory((current) =>
          rememberRung(current, fromPanel.chatterId, fromPanel.offenseId, fromPanel.rung)
        )
      }
    }

    setDraft('')
    setHint(null)
    setPending(null)
  }

  const writeDraft = (text: string) => {
    setDraft(text)
    setHint(null)
    // Rewritten by hand
    if (!text.startsWith('/')) setPending(null)
  }

  const shows = (window: ModViewWindow) =>
    available.includes(window) && !hidden.has(window) && (!only || only.includes(window))
  const lit = (target: string) => spotlight === target

  const toggleWindow = (window: ModViewWindow) =>
    setHidden((current) => {
      const next = new Set(current)
      if (next.has(window)) next.delete(window)
      else next.add(window)
      return next
    })

  const pickByName = (name: string) => {
    const found = findChatter(name)
    if (found) setPicked(found)
  }

  const pickedLines = picked
    ? state.messages.filter((message) => message.author.id === picked.id)
    : []
  const recentIds = [
    ...new Set(Object.values(memory).flatMap((byOffense) => Object.keys(byOffense))),
  ]
  const canInspect = permissions.includes(Permissions.LiveInspect)
  const canFocus = permissions.includes(Permissions.LiveFocus)

  return (
    <div
      className={cn(
        MODVIEW_FRAME.root,
        embedded || showcase ? MODVIEW_FRAME.embedded : MODVIEW_FRAME.bleed
      )}
    >
      {!embedded && !showcase && (
        <ModViewRail
          state={state}
          levelName={levelName}
          windows={available}
          hidden={hidden}
          onToggle={toggleWindow}
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
              onStop={() => {
                setActInPlace(false)
                void focus.stop()
              }}
            />
          )}

          <div className={only ? MODVIEW_FRAME.focus : MODVIEW_FRAME.grid}>
            <div className={only ? MODVIEW_FRAME.flat : MODVIEW_FRAME.column}>
              {shows('stream') && (
                <StreamWindow state={state} isLit={lit('stream')} isTitleLit={lit('title')} />
              )}
              <div className={only ? MODVIEW_FRAME.flat : MODVIEW_FRAME.pair}>
                {shows('modActions') && (
                  <ModActionsWindow
                    acts={state.acts}
                    isLit={lit('modActions')}
                    onPickTarget={pickByName}
                    focusLogin={following?.targetLogin ?? null}
                  />
                )}
                {shows('automod') && (
                  <AutoModWindow held={state.held} isLit={lit('automod')} gate={gate} onAct={act} />
                )}
              </div>
            </div>

            <div className={only ? MODVIEW_FRAME.flat : MODVIEW_FRAME.column}>
              {shows('chat') && (
                <ChatWindow
                  state={state}
                  spotlight={spotlight}
                  gate={gate}
                  onAct={act}
                  onPick={setPicked}
                  draft={draft}
                  onDraft={writeDraft}
                  onSend={send}
                  hint={hint}
                />
              )}
            </div>

            <div className={only ? MODVIEW_FRAME.flat : MODVIEW_FRAME.column}>
              {shows('community') &&
                (live ? (
                  <HistoryWindow
                    state={state}
                    spotlight={spotlight}
                    panel={panel}
                    memory={memory}
                    onPick={setPicked}
                    onPrefill={prefill}
                    live={{
                      id: live.id,
                      members: live.members.filter((member) => member.id !== live.viewerId),
                      canInspect,
                      canFocus: (accountId) => canFocus && live.focusable.includes(accountId),
                      focuses: focus.focuses,
                      onInspect: setInspected,
                      onFocus: (accountId) => void focus.start(accountId),
                    }}
                  />
                ) : (
                  <CommunityWindow
                    community={state.community}
                    spotlight={spotlight}
                    onPick={setPicked}
                  />
                ))}
              {shows('unbanRequests') && (
                <UnbanRequestsWindow
                  requests={state.unbanRequests}
                  isLit={lit('unbanRequests')}
                  gate={gate}
                  onAct={act}
                />
              )}
            </div>
          </div>

          {picked && (
            <ViewerCard
              chatter={picked}
              messages={pickedLines}
              gate={gate}
              onAct={act}
              onClose={() => setPicked(null)}
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
            recentIds={recentIds}
            onPrefill={prefill}
          />
        )}
      </div>
    </div>
  )
}
