'use client'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { EditableDetailGrid } from '@/components/structures/inline/EditableDetailGrid'
import { InlineArea } from '@/components/structures/inline/InlineArea'
import { InlineMarkdown } from '@/components/structures/inline/InlineMarkdown'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import {
  SANCTION_GRAVITY_OPTIONS,
  SANCTION_GRAVITY_REGISTRY,
} from '@/declarations/sanctions/registries'
import { accentPaint } from '@/declarations/ui/theme'
import { OFFENSE_SHEET } from '@/declarations/ui/variants'
import type { LiveconLevelView } from '@/types/livecon'
import type { SanctionOffenseDetail, SanctionRungInput } from '@/types/sanctions'
import { SanctionGravities } from '@/utils/constants/moderation'
import type { SanctionGravityName } from '@/utils/constants/moderation'
import { cn } from '@/utils/classnames'

export interface OffenseProfileProps {
  offense: SanctionOffenseDetail
  level: LiveconLevelView
  canManage: boolean
  levels: LiveconLevelView[]
  onLevelChange: (levelId: string) => void
  onSaveLadder: (
    id: string,
    levelId: string,
    gravity: SanctionGravityName,
    steps: SanctionRungInput[]
  ) => Promise<boolean>
  onSaveField: (name: string) => (value: string) => Promise<boolean>
}

/**
 * Gravity, description and suggested reason
 * @param {OffenseProfileProps} props - Offence and handlers
 * @return {JSX.Element}
 */

export const OffenseProfile = ({
  offense,
  level,
  levels,
  canManage,
  onLevelChange,
  onSaveLadder,
  onSaveField,
}: OffenseProfileProps) => {
  const copy = useCopy(SANCTION_COPY.copied)
  const tone = SANCTION_GRAVITY_REGISTRY.get(offense.gravities[level.id] ?? SanctionGravities.Low)

  const steps = (offense.ladders[level.id] ?? []).map((rung) => ({
    condition: rung.condition,
    measureIds: rung.measures.map((measure) => measure.id),
  }))
  const gravity = offense.gravities[level.id] ?? SanctionGravities.Low

  const tinted = (text: string, accent: string | null) => {
    const paint = accentPaint(accent)

    return (
      <span className={cn(OFFENSE_SHEET.propertyValue, paint.text)} style={paint.style}>
        {text}
      </span>
    )
  }

  return (
    <div className={OFFENSE_SHEET.body}>
      <EditableDetailGrid
        values={{ gravity, livecon: level.id }}
        issues={[]}
        disabled={!canManage}
        entries={[
          {
            label: SANCTION_COPY.gravityTitle,
            display: tinted(tone.short, tone.accent),
            field: {
              name: 'gravity',
              label: SANCTION_COPY.gravityTitle,
              kind: 'select',
              mark: 'priority',
              options: SANCTION_GRAVITY_OPTIONS,
            },
          },
          {
            label: SANCTION_COPY.liveconTitle,
            display: tinted(String(level.level), level.accent),
            field: {
              name: 'livecon',
              label: SANCTION_COPY.liveconTitle,
              kind: 'select',
              mark: 'glyph',
              options: levels.map((entry) => ({
                value: entry.id,
                label: entry.name,
                icon: entry.icon,
                accent: entry.accent ?? undefined,
              })),
            },
          },
        ]}
        onCommit={async (name, next) => {
          if (typeof next !== 'string') return false
          if (name === 'livecon') {
            onLevelChange(next)

            return true
          }

          return onSaveLadder(offense.id, level.id, next as SanctionGravityName, steps)
        }}
      />

      {(offense.summary || canManage) && (
        <div className={OFFENSE_SHEET.block}>
          <span className={OFFENSE_SHEET.label}>{SANCTION_COPY.descriptionTitle}</span>
          <div className={OFFENSE_SHEET.summary}>
            {canManage ? (
              <InlineMarkdown
                id="offense-summary"
                value={offense.summary ?? ''}
                placeholder={SANCTION_COPY.descriptionEmpty}
                maxLength={FORM_SETTINGS.markdownMaxLength}
                onCommit={onSaveField('summary')}
              />
            ) : (
              <Markdown source={offense.summary ?? ''} />
            )}
          </div>
        </div>
      )}

      {(offense.warningExample || canManage) && (
        <div className={OFFENSE_SHEET.block}>
          <span className={OFFENSE_SHEET.label}>{SANCTION_COPY.warningTitle}</span>
          <div className={OFFENSE_SHEET.warning}>
            <InlineArea
              id="offense-warning"
              value={offense.warningExample ?? ''}
              placeholder={SANCTION_COPY.warningEmpty}
              disabled={!canManage}
              maxLength={FORM_SETTINGS.longTextMaxLength}
              className="min-w-0 flex-1"
              onCommit={onSaveField('warningExample')}
            />
            {offense.warningExample && (
              <Button
                variant="icon"
                icon="copy"
                aria-label={SANCTION_COPY.copy}
                onClick={() => void copy(offense.warningExample!)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
