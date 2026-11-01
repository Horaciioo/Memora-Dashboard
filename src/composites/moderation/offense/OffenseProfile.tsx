'use client'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { InlineArea } from '@/components/structures/inline/InlineArea'
import { InlineMarkdown } from '@/components/structures/inline/InlineMarkdown'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { SANCTION_GRAVITY_REGISTRY } from '@/declarations/sanctions/registries'
import { accentPaint } from '@/declarations/ui/theme'
import { OFFENSE_SHEET } from '@/declarations/ui/variants'
import type { LiveconLevelView } from '@/types/livecon'
import type { SanctionOffenseDetail } from '@/types/sanctions'
import { SanctionGravities } from '@/utils/constants/moderation'
import { cn } from '@/utils/classnames'

export interface OffenseProfileProps {
  offense: SanctionOffenseDetail
  level: LiveconLevelView
  canManage: boolean
  onSaveField: (name: string) => (value: string) => Promise<boolean>
}

/**
 * Gravity, description and suggested reason
 * @param {OffenseProfileProps} props - Offence and handlers
 * @return {JSX.Element}
 */

export const OffenseProfile = ({ offense, level, canManage, onSaveField }: OffenseProfileProps) => {
  const copy = useCopy(SANCTION_COPY.copied)
  const tone = SANCTION_GRAVITY_REGISTRY.get(offense.gravities[level.id] ?? SanctionGravities.Low)

  const properties = [
    { key: 'gravity', title: SANCTION_COPY.gravityTitle, text: tone.short, accent: tone.accent },
    {
      key: 'livecon',
      title: SANCTION_COPY.liveconTitle,
      text: String(level.level),
      accent: level.accent,
    },
  ]

  return (
    <div className={OFFENSE_SHEET.body}>
      <div className={OFFENSE_SHEET.properties}>
        {properties.map((entry) => {
          const paint = accentPaint(entry.accent)

          return (
            <div key={entry.key} className={OFFENSE_SHEET.property}>
              <span className={OFFENSE_SHEET.label}>{entry.title}</span>
              <span className={cn(OFFENSE_SHEET.propertyValue, paint.text)} style={paint.style}>
                {entry.text}
              </span>
            </div>
          )
        })}
      </div>

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
