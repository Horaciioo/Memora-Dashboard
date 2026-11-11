'use client'

import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { ActionPreview } from '@/composites/modview/actions/ActionPreview'
import { ActionRowEditor } from '@/composites/modview/actions/ActionRowEditor'
import { useActionsDraft } from '@/composites/modview/actions/useActionsDraft'
import { actionLabel } from '@/core/lib/modview/actions'
import { formatDuration } from '@/core/lib/modview/commands'
import { MODVIEW_ACTION_COPY } from '@/declarations/modview/actionCopy'
import { MODVIEW_ACTION_KINDS, MODVIEW_ACTION_KIND_NAMES } from '@/declarations/modview/actions'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_ACTION_EDITOR, MODVIEW_MOBILE, OFFENSE_SHEET } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import { cn } from '@/utils/classnames'

/**
 * Actions of a moderator on a phone: rows to toggle and drag, a sheet to edit one
 * @return {JSX.Element}
 */

export const MobileActionsPanel = () => {
  const { draft, isFull, patch, move, add, remove, restore } = useActionsDraft()
  const [openId, setOpenId] = useState<string | null>(null)
  const [heldId, setHeldId] = useState<string | null>(null)
  const rows = useRef(new Map<string, HTMLLIElement>())
  const { openMenu } = useMenu()
  const DragIcon = ICONS.drag
  const AddIcon = ICONS.add
  const opened = draft.find((entry) => entry.id === openId) ?? null

  // The list keeps the pointer, so moving a row never drops the gesture
  const drag = (event: PointerEvent<HTMLUListElement>) => {
    if (!heldId) return
    const over = [...rows.current].find(([, row]) => {
      const box = row.getBoundingClientRect()

      return event.clientY >= box.top && event.clientY <= box.bottom
    })
    if (over && over[0] !== heldId) move(heldId, over[0])
  }

  const grab = (id: string, event: PointerEvent<HTMLSpanElement>) => {
    event.currentTarget.closest('ul')?.setPointerCapture(event.pointerId)
    setHeldId(id)
  }

  return (
    <div className={OFFENSE_SHEET.column}>
      <ActionPreview actions={draft} />

      {draft.length === 0 && (
        <p className={OFFENSE_SHEET.placeholder}>{MODVIEW_ACTION_COPY.empty}</p>
      )}
      <ul
        className={MODVIEW_MOBILE.actions}
        onPointerMove={drag}
        onPointerUp={() => setHeldId(null)}
        onPointerCancel={() => setHeldId(null)}
      >
        {draft.map((action) => {
          const Icon = ICONS[action.icon as IconName]
          const kind = MODVIEW_ACTION_KINDS[action.kind]

          return (
            <li
              key={action.id}
              ref={(node) => {
                if (node) rows.current.set(action.id, node)
                else rows.current.delete(action.id)
              }}
              style={{ '--tone': action.colour ?? kind.tone } as CSSProperties}
              className={cn(
                MODVIEW_MOBILE.actionRow,
                heldId === action.id && MODVIEW_MOBILE.actionRowHeld
              )}
            >
              <span
                className={MODVIEW_MOBILE.actionGrip}
                title={MODVIEW_ACTION_COPY.grab}
                onPointerDown={(event) => grab(action.id, event)}
              >
                <DragIcon className={MODVIEW_ACTION_EDITOR.iconGlyph} aria-hidden="true" />
              </span>
              <button
                type="button"
                className={MODVIEW_MOBILE.actionOpen}
                aria-label={`${MODVIEW_ACTION_COPY.edit} ${actionLabel(action)}`}
                onClick={() => setOpenId(action.id)}
              >
                <Icon
                  className={cn(
                    MODVIEW_MOBILE.actionGlyph,
                    !action.isOn && MODVIEW_MOBILE.actionGlyphOff
                  )}
                  aria-hidden="true"
                />
                <span className="flex min-w-0 flex-col">
                  <span
                    className={cn(
                      MODVIEW_MOBILE.actionTitle,
                      !action.isOn && MODVIEW_ACTION_EDITOR.off
                    )}
                  >
                    {kind.label}
                  </span>
                  <span className={MODVIEW_MOBILE.actionLine}>
                    {[action.seconds ? formatDuration(action.seconds) : null, action.reason]
                      .filter(Boolean)
                      .join(', ') ||
                      (action.isOn ? MODVIEW_ACTION_COPY.shown : MODVIEW_ACTION_COPY.hidden)}
                  </span>
                </span>
              </button>
              <Toggle
                bare
                checked={action.isOn}
                label={`${MODVIEW_ACTION_COPY.switchOn} ${actionLabel(action)}`}
                onChange={(isOn) => patch(action.id, { isOn })}
              />
            </li>
          )
        })}
        <li>
          <button
            type="button"
            className={MODVIEW_MOBILE.actionNew}
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

      <Button variant="ghost" icon="restore" onClick={restore}>
        {MODVIEW_ACTION_COPY.restore}
      </Button>

      <BottomSheet
        open={opened !== null}
        onClose={() => setOpenId(null)}
        title={opened ? kindTitle(opened.kind) : MODVIEW_ACTION_COPY.edit}
      >
        {opened && (
          <div className={MODVIEW_MOBILE.actionSheet}>
            <h3 className={MODVIEW_MOBILE.actionSheetTitle}>{kindTitle(opened.kind)}</h3>
            <ActionRowEditor action={opened} onChange={(values) => patch(opened.id, values)} />
            <Button
              variant="danger"
              icon="remove"
              onClick={() => {
                remove(opened.id)
                setOpenId(null)
              }}
            >
              {MODVIEW_ACTION_COPY.remove}
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

// Name of a kind
const kindTitle = (kind: keyof typeof MODVIEW_ACTION_KINDS): string =>
  MODVIEW_ACTION_KINDS[kind].label
