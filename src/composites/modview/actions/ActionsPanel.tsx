'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { ActionPreview } from '@/composites/modview/actions/ActionPreview'
import { ActionRowEditor } from '@/composites/modview/actions/ActionRowEditor'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { actionLabel } from '@/core/lib/modview/actions'
import { formatDuration } from '@/core/lib/modview/commands'
import { MODVIEW_ACTION_COPY } from '@/declarations/modview/actionCopy'
import {
  MODVIEW_ACTION_KINDS,
  MODVIEW_ACTION_KIND_NAMES,
  MODVIEW_ACTION_LIMITS,
  MODVIEW_DEFAULT_ACTIONS,
} from '@/declarations/modview/actions'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_ACTION_EDITOR, OFFENSE_SHEET } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { ModActionConfig, ModActionKind } from '@/types/modview'
import { cn } from '@/utils/classnames'

// Glyph of a row, in its tile
const KindIcon = ({ icon }: { icon: string }) => {
  const Icon = ICONS[icon as IconName]

  return <Icon className={MODVIEW_ACTION_EDITOR.tileIcon} aria-hidden="true" />
}

// Fresh action of a kind
const newAction = (kind: ModActionKind): ModActionConfig => ({
  id: `a-${crypto.randomUUID().slice(0, 8)}`,
  kind,
  seconds: kind === 'timeout' ? MODVIEW_ACTION_LIMITS.newSeconds : null,
  reason: null,
  icon: MODVIEW_ACTION_KINDS[kind].icon,
  look: 'icon',
  colour: null,
  isOn: true,
})

/**
 * Settings page where a moderator composes their sanction buttons
 * @return {JSX.Element}
 */

export const ActionsPanel = () => {
  const { preferences, preview } = useModPreferences()
  const [draft, setDraft] = useState(preferences.actions)
  const [openId, setOpenId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const DragIcon = ICONS.drag
  const { openMenu } = useMenu()

  // Every edit shows live, in the drawer and in the chat, until saved
  const change = (next: ModActionConfig[]) => {
    setDraft(next)
    preview({ actions: next })
  }
  const patch = (id: string, values: Partial<ModActionConfig>) =>
    change(draft.map((entry) => (entry.id === id ? { ...entry, ...values } : entry)))
  const move = (from: string, to: string) => {
    const fromIndex = draft.findIndex((entry) => entry.id === from)
    const toIndex = draft.findIndex((entry) => entry.id === to)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
    const next = [...draft]
    next.splice(toIndex, 0, next.splice(fromIndex, 1)[0]!)
    change(next)
  }
  return (
    <div className={OFFENSE_SHEET.column}>
      <div className={OFFENSE_SHEET.block}>
        <span className={OFFENSE_SHEET.label}>{MODVIEW_ACTION_COPY.previewHead}</span>
        <ActionPreview actions={draft} />
      </div>

      <div className={OFFENSE_SHEET.block}>
        <div className={MODVIEW_ACTION_EDITOR.toolbar}>
          <p className={MODVIEW_ACTION_EDITOR.hint}>{MODVIEW_ACTION_COPY.hint}</p>
          <Button
            variant="ghost"
            icon="add"
            iconAfter="expand"
            disabled={draft.length >= MODVIEW_ACTION_LIMITS.maxTotal}
            title={
              draft.length >= MODVIEW_ACTION_LIMITS.maxTotal ? MODVIEW_ACTION_COPY.full : undefined
            }
            onClick={(event) => {
              const box = event.currentTarget.getBoundingClientRect()
              openMenu(
                MODVIEW_ACTION_KIND_NAMES.map((kind) => ({
                  id: kind,
                  label: MODVIEW_ACTION_KINDS[kind].label,
                  icon: MODVIEW_ACTION_KINDS[kind].icon as IconName,
                  onSelect: () => {
                    const fresh = newAction(kind)
                    change([...draft, fresh])
                    setOpenId(fresh.id)
                  },
                })),
                { x: box.left, y: box.bottom }
              )
            }}
          >
            {MODVIEW_ACTION_COPY.add}
          </Button>
          <Button
            variant="ghost"
            icon="restore"
            onClick={() => change([...MODVIEW_DEFAULT_ACTIONS])}
          >
            {MODVIEW_ACTION_COPY.restore}
          </Button>
          <Button
            variant="ghost"
            icon="remove"
            disabled={draft.length === 0}
            onClick={() => change([])}
          >
            {MODVIEW_ACTION_COPY.removeAll}
          </Button>
        </div>
        {draft.length === 0 && (
          <p className={OFFENSE_SHEET.placeholder}>{MODVIEW_ACTION_COPY.empty}</p>
        )}
        <ul className={MODVIEW_ACTION_EDITOR.list}>
          {draft.map((action, index) => (
            <li
              key={action.id}
              style={{ '--tone': MODVIEW_ACTION_KINDS[action.kind].tone } as CSSProperties}
              className={cn(
                MODVIEW_ACTION_EDITOR.card,
                dragId === action.id && MODVIEW_ACTION_EDITOR.dragging
              )}
              draggable
              onDragStart={() => setDragId(action.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dragId && move(dragId, action.id)}
              onDragEnd={() => setDragId(null)}
            >
              <div className={MODVIEW_ACTION_EDITOR.cardRow}>
                <span className={MODVIEW_ACTION_EDITOR.grip} title={MODVIEW_ACTION_COPY.grab}>
                  <DragIcon className={MODVIEW_ACTION_EDITOR.iconGlyph} aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    MODVIEW_ACTION_EDITOR.tile,
                    !action.isOn && MODVIEW_ACTION_EDITOR.off
                  )}
                  style={action.colour ? ({ '--tone': action.colour } as CSSProperties) : undefined}
                >
                  <KindIcon icon={action.icon} />
                </span>
                <div className={MODVIEW_ACTION_EDITOR.cardBody}>
                  <p
                    className={cn(
                      MODVIEW_ACTION_EDITOR.cardTitle,
                      !action.isOn && MODVIEW_ACTION_EDITOR.off
                    )}
                  >
                    {MODVIEW_ACTION_KINDS[action.kind].label}
                  </p>
                  {action.seconds && (
                    <p className={MODVIEW_ACTION_EDITOR.cardLine}>
                      {formatDuration(action.seconds)}
                    </p>
                  )}
                  {action.reason && (
                    <p className={MODVIEW_ACTION_EDITOR.cardLine}>
                      {MODVIEW_ACTION_COPY.reasonLine.replace('{reason}', action.reason)}
                    </p>
                  )}
                  <p className={MODVIEW_ACTION_EDITOR.cardLine}>
                    {action.isOn ? MODVIEW_ACTION_COPY.shown : MODVIEW_ACTION_COPY.hidden}
                  </p>
                </div>
                <div className={MODVIEW_ACTION_EDITOR.cardSide}>
                  <Toggle
                    bare
                    checked={action.isOn}
                    label={`${MODVIEW_ACTION_COPY.switchOn} ${actionLabel(action)}`}
                    onChange={(isOn) => patch(action.id, { isOn })}
                  />
                </div>
                <div className={MODVIEW_ACTION_EDITOR.cardButtons}>
                  <Button
                    variant="ghost"
                    icon="settings"
                    aria-expanded={openId === action.id}
                    onClick={() => setOpenId(openId === action.id ? null : action.id)}
                  >
                    {MODVIEW_ACTION_COPY.edit}
                  </Button>
                  <Button
                    variant="ghost"
                    icon="remove"
                    onClick={() => change(draft.filter((entry) => entry.id !== action.id))}
                  >
                    {MODVIEW_ACTION_COPY.remove}
                  </Button>
                </div>
              </div>
              {openId === action.id && (
                <ActionRowEditor action={action} onChange={(values) => patch(action.id, values)} />
              )}
              {index === MODVIEW_ACTION_LIMITS.maxInline - 1 && draft.length > index + 1 && (
                <p className={MODVIEW_ACTION_EDITOR.fold}>{MODVIEW_ACTION_COPY.overflow}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
