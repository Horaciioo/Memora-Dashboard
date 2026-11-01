'use client'

import { EditableDetailGrid } from '@/components/structures/inline/EditableDetailGrid'
import { LadderView } from '@/composites/moderation/offense/OffenseRungs'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import {
  SANCTION_GRAVITY_OPTIONS,
  SANCTION_GRAVITY_REGISTRY,
} from '@/declarations/sanctions/registries'
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
  const gravity = offense.gravities[level.id] ?? SanctionGravities.Low
  const rungs = offense.ladders[level.id] ?? []
  const steps = rungs.map((rung) => ({
    condition: rung.condition,
    measureIds: rung.measures.map((measure) => measure.id),
  }))

  return (
    <div className={OFFENSE_SHEET.body}>
      <div className={OFFENSE_SHEET.block}>
        <span className={OFFENSE_SHEET.label}>
          {SANCTION_COPY.ladderTitle.replace('{level}', level.name)}
        </span>
        <LadderView
          rungs={rungs}
          offense={offense}
          edit={
            canManage
              ? {
                  measures,
                  onSave: (next) => onSaveLadder(offense.id, level.id, gravity, next),
                }
              : undefined
          }
        />
        {canManage && (
          <EditableDetailGrid
            stacked
            values={{ gravity }}
            issues={[]}
            disabled={isSaving}
            entries={[
              {
                label: SANCTION_COPY.gravity,
                field: {
                  name: 'gravity',
                  label: SANCTION_COPY.gravity,
                  kind: 'select',
                  mark: 'priority',
                  options: SANCTION_GRAVITY_OPTIONS,
                },
                display: SANCTION_GRAVITY_REGISTRY.get(gravity).label,
              },
            ]}
            onCommit={(_, next) =>
              onSaveLadder(offense.id, level.id, (next as SanctionGravityName) ?? gravity, steps)
            }
          />
        )}
      </div>
    </div>
  )
}
