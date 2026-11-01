'use client'

import { useState } from 'react'

import { LadderEditor } from '@/composites/moderation/offense/LadderEditor'
import { LadderView } from '@/composites/moderation/offense/OffenseRungs'
import { useActionMenu } from '@/core/hooks/interaction/layout/useActionMenu'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { OFFENSE_SHEET } from '@/declarations/ui/variants'
import type { LiveconLevelView } from '@/types/livecon'
import type {
  SanctionMeasureView,
  SanctionOffenseDetail,
  SanctionRungInput,
} from '@/types/sanctions'
import { SanctionGravities } from '@/utils/constants/moderation'
import type { SanctionGravityName } from '@/utils/constants/moderation'

export interface OffenseLadderTabProps {
  offense: SanctionOffenseDetail
  level: LiveconLevelView
  measures: SanctionMeasureView[]
  canManage: boolean
  isSaving: boolean
  onSaveLadder: (
    id: string,
    levelId: string,
    gravity: SanctionGravityName,
    steps: SanctionRungInput[]
  ) => Promise<boolean>
}

/**
 * Ladder of the level in force
 * @param {OffenseLadderTabProps} props - Offence and handlers
 * @return {JSX.Element}
 */

export const OffenseLadderTab = ({
  offense,
  level,
  measures,
  canManage,
  isSaving,
  onSaveLadder,
}: OffenseLadderTabProps) => {
  const [editing, setEditing] = useState(false)
  const gravity = offense.gravities[level.id] ?? SanctionGravities.Low
  const rungs = offense.ladders[level.id] ?? []

  const menu = useActionMenu(
    canManage
      ? [
          {
            id: 'ladder',
            label: SANCTION_COPY.ladderEmpty,
            icon: 'edit',
            onSelect: () => setEditing(true),
          },
        ]
      : []
  )

  return (
    <div className={OFFENSE_SHEET.body}>
      <div className={OFFENSE_SHEET.block}>
        <span className={OFFENSE_SHEET.label}>
          {SANCTION_COPY.ladderTitle.replace('{level}', level.name)}
        </span>
        {editing ? (
          <LadderEditor
            initial={rungs}
            gravity={gravity}
            measures={measures}
            isSaving={isSaving}
            onCancel={() => setEditing(false)}
            onSave={async (nextGravity, steps) => {
              const done = await onSaveLadder(offense.id, level.id, nextGravity, steps)
              if (done) setEditing(false)
            }}
          />
        ) : canManage ? (
          <div
            role="button"
            tabIndex={0}
            className={OFFENSE_SHEET.ladderLive}
            onClick={() => setEditing(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') setEditing(true)
            }}
            onContextMenu={menu.onContextMenu}
          >
            {rungs.length === 0 ? (
              <span className={OFFENSE_SHEET.placeholder}>{SANCTION_COPY.ladderEmpty}</span>
            ) : (
              <LadderView rungs={rungs} offense={offense} />
            )}
          </div>
        ) : (
          <LadderView rungs={rungs} offense={offense} />
        )}
      </div>
    </div>
  )
}
