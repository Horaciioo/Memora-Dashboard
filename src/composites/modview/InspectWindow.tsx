'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { ICONS } from '@/declarations/ui/icons'
import { InspectCard } from '@/composites/modview/InspectCard'
import { ModWindow, WindowEmpty } from '@/composites/modview/ModWindow'
import { SanctionHistory } from '@/composites/modview/SanctionHistory'
import type { SanctionHistoryProps } from '@/composites/modview/SanctionHistory'
import { useGlideBox } from '@/core/hooks/interaction/layout/useGlideBox'
import { useLiveRoster } from '@/core/hooks/data/lives/useLiveRoster'
import { MODVIEW_HISTORY_COPY, MODVIEW_INSPECT_COPY } from '@/declarations/modview/copy'
import { MODVIEW_WINDOWS } from '@/declarations/modview/registries'
import { MODVIEW_INSPECT, MODVIEW_TABS } from '@/declarations/ui/variants'
import type { LivePerson } from '@/types/lives'
import { cn } from '@/utils/classnames'

export interface InspectWindowProps {
  liveId: string
  viewerId: string
  members: LivePerson[]
  inspected: string | null
  onInspect: (accountId: string | null) => void
  // Who was sanctioned on the live
  history: SanctionHistoryProps
}

type InspectTab = 'team' | 'sanctions'

/**
 * Window of Inspect Mod: the moderators online and what they do, the sanctions of the live
 * @param {InspectWindowProps} props - Window props
 * @return {JSX.Element}
 */

export const InspectWindow = ({
  liveId,
  viewerId,
  members,
  inspected,
  onInspect,
  history,
}: InspectWindowProps) => {
  const [tab, setTab] = useState<InspectTab>('team')
  const { roster } = useLiveRoster(liveId, true)
  const online = new Set(roster?.connectedIds ?? [])
  const people = members.filter((member) => member.id !== viewerId && online.has(member.id))
  const NextIcon = ICONS.next
  const { listRef, boxRef } = useGlideBox<HTMLSpanElement>(tab)

  const tabs: { key: InspectTab; label: string }[] = [
    { key: 'team', label: MODVIEW_INSPECT_COPY.tabTeam },
    { key: 'sanctions', label: MODVIEW_HISTORY_COPY.sanctionsTitle },
  ]

  return (
    <ModWindow
      title={
        <span
          ref={listRef}
          className={MODVIEW_TABS.list}
          role="tablist"
          aria-label={MODVIEW_WINDOWS.label('inspect')}
        >
          <span ref={boxRef} className={MODVIEW_TABS.box} aria-hidden="true" />
          {tabs.map((entry) => (
            <button
              key={entry.key}
              type="button"
              role="tab"
              aria-selected={tab === entry.key}
              draggable={false}
              className={cn(MODVIEW_TABS.tab, tab === entry.key && MODVIEW_TABS.tabOn)}
              onClick={() => setTab(entry.key)}
            >
              <span className={MODVIEW_TABS.tabLabel}>{entry.label}</span>
            </button>
          ))}
        </span>
      }
      label={MODVIEW_WINDOWS.label('inspect')}
      grow
    >
      {tab === 'sanctions' ? (
        <div className={MODVIEW_INSPECT.body}>
          <SanctionHistory {...history} />
        </div>
      ) : inspected ? (
        <InspectCard liveId={liveId} accountId={inspected} onClose={() => onInspect(null)} />
      ) : people.length === 0 ? (
        <WindowEmpty
          icon="search"
          title={MODVIEW_INSPECT_COPY.emptyTitle}
          body={MODVIEW_INSPECT_COPY.nobody}
        />
      ) : (
        <div className={MODVIEW_INSPECT.body}>
          <p className={MODVIEW_INSPECT.hint}>{MODVIEW_INSPECT_COPY.emptyBody}</p>
          <ul className={MODVIEW_INSPECT.team}>
            {people.map((person) => (
              <li key={person.id} className={MODVIEW_INSPECT.item}>
                <button
                  type="button"
                  className={MODVIEW_INSPECT.pick}
                  onClick={() => onInspect(person.id)}
                >
                  <Avatar name={person.name} src={person.avatar} size="sm" />
                  <span className={MODVIEW_INSPECT.pickName}>{person.name}</span>
                  <NextIcon className={MODVIEW_INSPECT.pickIcon} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ModWindow>
  )
}
