'use client'

import { useState } from 'react'

import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { useActionMenu } from '@/core/hooks/interaction/useActionMenu'
import { useLivecon } from '@/core/hooks/data/useLivecon'
import { levelOfCreator } from '@/declarations/livecon/levels'
import { LIVECON_COPY } from '@/declarations/livecon/copy'
import { ICONS } from '@/declarations/ui/icons'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { accentVars } from '@/declarations/ui/theme'
import { LIVECON_TITLE } from '@/declarations/ui/variants'
import type { FieldDefinition } from '@/types/forms'
import type { LiveconLevelView, LiveconStateView } from '@/types/livecon'
import { cn } from '@/utils/classnames'

export interface LiveconTitleProps {
  creatorId: string
  levels: LiveconLevelView[]
  initialState: LiveconStateView[]
  fields: FieldDefinition[]
  canUpdate: boolean
  onLevelChange: (level: LiveconLevelView) => void
}

/**
 * The livecon in force as a glyph and its name
 * @param {LiveconTitleProps} props - Creator
 * @return {JSX.Element}
 */

export const LiveconTitle = ({
  creatorId,
  levels,
  initialState,
  fields,
  canUpdate,
  onLevelChange,
}: LiveconTitleProps) => {
  const livecon = useLivecon(initialState)
  const [target, setTarget] = useState<LiveconLevelView | null>(null)
  const inForce = levelOfCreator(livecon.state, creatorId)?.level ?? levels[0]
  const Icon = ICONS[inForce?.icon ?? 'livecon']

  // Every other level
  const menu = useActionMenu(
    levels
      .filter((level) => level.id !== inForce?.id)
      .map((level) => ({
        id: level.id,
        label: LIVECON_COPY.switchTo.replace('{level}', level.name),
        icon: level.icon ?? 'livecon',
        onSelect: () => {
          livecon.clearIssues()
          setTarget(level)
        },
      }))
  )

  if (!inForce) return null

  const content = (
    <>
      <Icon className={LIVECON_TITLE.icon} aria-hidden="true" />
      <span className={LIVECON_TITLE.name}>{inForce.name}</span>
      <MaturityTag maturity="new" interactive={false} compact />
    </>
  )

  return (
    <>
      {canUpdate ? (
        <button
          type="button"
          aria-label={LIVECON_COPY.changeTitle}
          className={cn(LIVECON_TITLE.base, LIVECON_TITLE.interactive)}
          style={accentVars(inForce.accent)}
          {...menu}
        >
          {content}
        </button>
      ) : (
        <div className={LIVECON_TITLE.base} style={accentVars(inForce.accent)}>
          {content}
        </div>
      )}

      <FormDrawer
        subject={FORM_SUBJECTS.livecon}
        open={target !== null}
        title={LIVECON_COPY.changeTitle}
        fields={fields.filter((field) => field.name !== 'youtuberId')}
        initialValues={{ youtuberId: creatorId, levelId: target?.id ?? null }}
        issues={livecon.issues}
        isSaving={livecon.isSaving}
        onSubmit={async (values) => {
          const done = await livecon.apply(values)
          if (done && target) onLevelChange(target)

          return done
        }}
        onClose={() => setTarget(null)}
      />
    </>
  )
}
