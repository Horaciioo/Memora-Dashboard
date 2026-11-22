'use client'

import { useState } from 'react'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { DotMark } from '@/components/elements/display/Dotted'
import { ActSentence } from '@/composites/modview/ActSentence'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import { WindowEmpty } from '@/composites/modview/ModWindow'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { MODVIEW_ACT_COPY, MODVIEW_COPY } from '@/declarations/modview/copy'
import { MOD_ACTS } from '@/declarations/modview/registries'
import { MODVIEW_FEED } from '@/declarations/ui/variants'
import type { ModAct, ModActKind } from '@/types/modview'
import { formatSince } from '@/utils/format/time/dates'

// Acts that settle a held message
const HANDLED: ModActKind[] = ['automodApprove', 'automodDeny', 'automodExpire']

type HistoryFilter = 'all' | 'approved' | 'rejected'

// Kinds each filter keeps
const FILTER_KINDS: Record<HistoryFilter, ModActKind[]> = {
  all: HANDLED,
  approved: ['automodApprove'],
  rejected: ['automodDeny', 'automodExpire'],
}

const FILTER_OPTIONS: { value: HistoryFilter; label: string }[] = [
  { value: 'all', label: MODVIEW_COPY.heldHistoryAll },
  { value: 'approved', label: MODVIEW_COPY.heldHistoryApproved },
  { value: 'rejected', label: MODVIEW_COPY.heldHistoryRejected },
]

export interface AutoModHistoryProps {
  // Acts of the live, newest first
  acts: ModAct[]
  // Open the viewer, to sanction after a refusal
  onPickAct: (act: ModAct) => void
  colourOf: (id: string | null | undefined, name: string | null) => string | undefined
}

/**
 * Messages the queue already settled, accepted or rejected
 * @param {AutoModHistoryProps} props - History props
 * @return {JSX.Element}
 */

export const AutoModHistory = ({ acts, onPickAct, colourOf }: AutoModHistoryProps) => {
  const [filter, setFilter] = useState<HistoryFilter>('all')
  const { preferences } = useModPreferences()
  const rows = acts.filter((act) => FILTER_KINDS[filter].includes(act.kind))

  return (
    <>
      <div className={MODVIEW_FEED.filter}>
        <SegmentedControl
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
          label={MODVIEW_COPY.heldHistoryFilter}
          isFull
        />
      </div>
      {rows.length === 0 ? (
        <WindowEmpty
          icon="automod"
          title={MODVIEW_COPY.heldHistoryEmptyTitle}
          body={MODVIEW_COPY.heldHistoryEmptyBody}
        />
      ) : (
        <ul className={MODVIEW_FEED.list}>
          {rows.map((act) => (
            <li key={act.id} className={MODVIEW_FEED.item}>
              <div className={MODVIEW_FEED.main}>
                {act.target && (
                  <button
                    type="button"
                    className={MODVIEW_FEED.target}
                    style={{
                      color: preferences.colouredNames
                        ? colourOf(act.targetId, act.target)
                        : undefined,
                    }}
                    onClick={() => onPickAct(act)}
                  >
                    {act.target}
                  </button>
                )}
                <p className={MODVIEW_FEED.line}>
                  <ActSentence
                    text={MODVIEW_ACT_COPY[act.kind]}
                    verb={MOD_ACTS.get(act.kind).verb}
                    tone={MOD_ACTS.get(act.kind).tone}
                  />{' '}
                  <span className={MODVIEW_FEED.who}>{act.moderator}</span>
                  <DotMark />
                  {formatSince(act.at)}
                </p>
                {act.quote && (
                  <p className={MODVIEW_FEED.quote}>
                    <FlaggedText text={act.quote} />
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
