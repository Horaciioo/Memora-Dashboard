'use client'

import { useCallback, useMemo, useState } from 'react'

import { AutoModWindow } from '@/composites/modview/AutoModWindow'
import { ChatWindow } from '@/composites/modview/ChatWindow'
import { CommunityWindow } from '@/composites/modview/CommunityWindow'
import { ModActionsWindow } from '@/composites/modview/ModActionsWindow'
import { SanctionsDrawer } from '@/composites/modview/SanctionsDrawer'
import { StreamWindow } from '@/composites/modview/StreamWindow'
import { UnbanRequestsWindow } from '@/composites/modview/UnbanRequestsWindow'
import { ViewerCard } from '@/composites/modview/ViewerCard'
import { ModViewRail } from '@/composites/modview/ModViewRail'
import { gateIntent, windowsOf } from '@/core/lib/modview/gate'
import { MODVIEW_FRAME, MODVIEW_SPOTLIGHT } from '@/declarations/ui/variants'
import type { Chatter, ModViewDriver, ModViewIntent, ModViewWindow } from '@/types/modview'
import type { SanctionPanelView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'
import type { PermissionName } from '@/utils/constants/permissions'

export interface ModViewProps {
  driver: ModViewDriver
  permissions: PermissionName[]
  panel: SanctionPanelView | null
  levelName: string | null
  // Inside a course: no rail taken, no page bleed, sanctions folded away
  embedded?: boolean
  // Windows kept, in a single row
  only?: ModViewWindow[]
}

/**
 * Moderator view of one live, fed by a live or a scripted driver
 * @param {ModViewDriver} driver - Data source
 * @param {PermissionName[]} permissions - Held on this live
 * @param {SanctionPanelView | null} panel - Creator panel at the level in force
 * @param {string | null} levelName - Livecon level in force
 * @param {boolean} [embedded] - Played inside a course
 * @param {ModViewWindow[]} [only] - Windows kept
 * @return {JSX.Element}
 */

export const ModView = ({
  driver,
  permissions,
  panel,
  levelName,
  embedded = false,
  only,
}: ModViewProps) => {
  const { state, spotlight } = driver
  const [hidden, setHidden] = useState<Set<ModViewWindow>>(new Set())
  const [picked, setPicked] = useState<Chatter | null>(null)
  const [isPanelOpen, setPanelOpen] = useState(true)

  const available = useMemo(() => windowsOf(state.platform), [state.platform])

  const gate = useCallback(
    (intent: ModViewIntent) =>
      gateIntent(intent, {
        permissions,
        platform: state.platform,
        liveconLevel: state.liveconLevel,
        offline: state.connection === 'disconnected' || state.connection === 'connecting',
      }),
    [permissions, state.platform, state.liveconLevel, state.connection]
  )

  // A refused gesture never reaches the driver
  const act = useCallback(
    (intent: ModViewIntent) => {
      if (gate(intent).allowed) void driver.act(intent)
    },
    [driver, gate]
  )

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
    const line = state.messages.find((message) => message.author.name === name)
    if (line) setPicked(line.author)
  }

  const pickedLines = picked
    ? state.messages.filter((message) => message.author.id === picked.id)
    : []

  return (
    <div
      className={cn(MODVIEW_FRAME.root, embedded ? MODVIEW_FRAME.embedded : MODVIEW_FRAME.bleed)}
    >
      {!embedded && (
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
                />
              )}
            </div>

            <div className={only ? MODVIEW_FRAME.flat : MODVIEW_FRAME.column}>
              {shows('community') && (
                <CommunityWindow
                  community={state.community}
                  spotlight={spotlight}
                  onPick={setPicked}
                />
              )}
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
        </div>

        {!embedded && (
          <SanctionsDrawer
            panel={panel}
            levelName={levelName}
            isOpen={isPanelOpen}
            onToggle={() => setPanelOpen((open) => !open)}
            target={picked}
            targetLines={pickedLines}
            gate={gate}
            onAct={act}
          />
        )}
      </div>
    </div>
  )
}
