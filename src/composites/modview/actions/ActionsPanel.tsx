'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { ActionPreview } from '@/composites/modview/actions/ActionPreview'
import { ActionRowEditor } from '@/composites/modview/actions/ActionRowEditor'
import { useActionsDraft } from '@/composites/modview/actions/useActionsDraft'
import { actionLabel } from '@/core/lib/modview/actions'
import { formatDuration } from '@/core/lib/modview/commands'
import { MODVIEW_ACTION_COPY } from '@/declarations/modview/actionCopy'
import {
  MODVIEW_ACTION_KINDS,
  MODVIEW_ACTION_KIND_NAMES,
  MODVIEW_ACTION_LIMITS,
} from '@/declarations/modview/actions'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_ACTION_EDITOR, OFFENSE_SHEET } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import { cn } from '@/utils/classnames'

// Glyph of a row, in the tone of its kind
const KindIcon = ({
  icon,
  colour,
  isOn,
}: {
  icon: string
  colour: string | null
  isOn: boolean
}) => {
  const Icon = ICONS[icon as IconName]

  return (
    <Icon
      className={cn(MODVIEW_ACTION_EDITOR.glyph, !isOn && MODVIEW_ACTION_EDITOR.glyphOff)}
      style={colour ? ({ '--tone': colour } as CSSProperties) : undefined}
      aria-hidden="true"
    />
  )
}

/**
 * Settings page where a moderator composes their sanction buttons
 * @return {JSX.Element}
 */

export const ActionsPanel = () => {
  const { draft, isFull, patch, move, add, remove, restore, clear } = useActionsDraft()
  const [openId, setOpenId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const DragIcon = ICONS.drag
  const AddIcon = ICONS.add
  const { openMenu } = useMenu()

  return (
    <div className={OFFENSE_SHEET.column}>
      <div className={OFFENSE_SHEET.block}>
        <span className={OFFENSE_SHEET.label}>{MODVIEW_ACTION_COPY.previewHead}</span>
        <ActionPreview actions={draft} />
      </div>

      <div className={OFFENSE_SHEET.block}>
        <div className={MODVIEW_ACTION_EDITOR.toolbar}>
          <div className={MODVIEW_ACTION_EDITOR.tools}>
            <Button variant="ghost" icon="restore" onClick={restore}>
              {MODVIEW_ACTION_COPY.restore}
            </Button>
            <Button variant="ghost" icon="remove" disabled={draft.length === 0} onClick={clear}>
              {MODVIEW_ACTION_COPY.removeAll}
            </Button>
          </div>
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
                <KindIcon icon={action.icon} colour={action.colour} isOn={action.isOn} />
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
                  <Button variant="ghost" icon="remove" onClick={() => remove(action.id)}>
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
          <li>
            <button
              type="button"
              className={MODVIEW_ACTION_EDITOR.newBox}
              disabled={isFull}
              title={isFull ? MODVIEW_ACTION_COPY.full : undefined}
              onClick={(event) => {
                const box = event.currentTarget.getBoundingClientRect()
                openMenu(
                  MODVIEW_ACTION_KIND_NAMES.map((kind) => ({
                    id: kind,
                    label: MODVIEW_ACTION_KINDS[kind].label,
                    icon: MODVIEW_ACTION_KINDS[kind].icon as IconName,
                    onSelect: () => setOpenId(add(kind).id),
                  })),
                  { x: box.left, y: box.top }
                )
              }}
            >
              <AddIcon className={MODVIEW_ACTION_EDITOR.iconGlyph} aria-hidden="true" />
              {MODVIEW_ACTION_COPY.add}
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
