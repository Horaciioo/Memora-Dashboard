'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Field } from '@/components/elements/forms/Field'
import { Input } from '@/components/elements/forms/Input'
import { Dialog } from '@/components/structures/Dialog'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { ACCESS_CATEGORY_ORDER, ACCESS_CATEGORY_REGISTRY } from '@/declarations/access/categories'
import { ACCESS_CONSOLE } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import { FunctionKinds } from '@/utils/constants/workflow'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { AccessCategoryName } from '@/utils/constants/hierarchy'
import { cn } from '@/utils/classnames'
import type { AccessCollection } from '@/core/hooks/data/useAccess'
import type { AccessSelection } from '@/composites/access/AccessConsole'

export interface RoleListProps {
  roles: AccessCollection['console']['roles']
  functions: AccessCollection['console']['functions']
  selectedId: string | null
  canManageEncadrement: boolean
  access: AccessCollection
  onPick: (selection: AccessSelection) => void
}

/**
 * Glyph of a row
 * @param {string | null} icon - Stored glyph key
 * @return {JSX.Element | null}
 */

const RowIcon = ({ icon }: { icon: string | null }) => {
  if (!icon || !(icon in ICONS)) return null

  const Glyph = ICONS[icon as keyof typeof ICONS]

  return <Glyph className={ACCESS_CONSOLE.rowIcon} aria-hidden="true" />
}

/**
 * Discord-style role rail — one section per declared category
 * @param {AccessConsole['roles']} roles - Hierarchy levels
 * @param {AccessConsole['functions']} functions - Every function
 * @param {string | null} selectedId - Row on screen
 * @param {boolean} canManageEncadrement - Viewer may add to the leader tier
 * @param {AccessCollection} access - Console state and mutations
 * @param {(selection: AccessSelection) => void} onPick - Row handler
 * @return {JSX.Element}
 */

export const RoleList = ({
  roles,
  functions,
  selectedId,
  canManageEncadrement,
  access,
  onPick,
}: RoleListProps) => {
  const [addingTo, setAddingTo] = useState<AccessCategoryName | null>(null)
  const [name, setName] = useState('')
  const Add = ICONS.add

  const submit = async () => {
    if (name.trim().length === 0 || addingTo === null) return

    const next = await access.createFunction({
      name: name.trim(),
      category: addingTo,
      kind: FunctionKinds.Primary,
      accent: null,
      icon: null,
      summary: null,
    })

    if (next) {
      const created = next.functions.find(
        (entry) => entry.category === addingTo && entry.name === name.trim()
      )
      if (created) onPick({ kind: 'function', fn: created })
    }

    setName('')
    setAddingTo(null)
  }

  return (
    <>
      {ACCESS_CATEGORY_ORDER.map((category) => {
        const meta = ACCESS_CATEGORY_REGISTRY.get(category)
        const role = roles.find((entry) => entry.category === category)
        const owned = functions.filter((entry) => entry.category === category)
        const canAdd = meta.tier !== MemberRoles.Admin || canManageEncadrement

        return (
          <div key={category} className={ACCESS_CONSOLE.category}>
            <p className={ACCESS_CONSOLE.categoryHead}>{meta.label}</p>

            {role && (
              <button
                type="button"
                className={cn(
                  ACCESS_CONSOLE.row,
                  selectedId === role.role && ACCESS_CONSOLE.rowActive,
                  role.locked && ACCESS_CONSOLE.rowLocked
                )}
                onClick={() => onPick({ kind: 'role', role })}
              >
                <RowIcon icon={role.icon} />
                <span
                  className={cn(ACCESS_CONSOLE.rowLabel, 'accent-text')}
                  style={accentVars(role.accent, 'neutral')}
                >
                  {role.label}
                </span>
              </button>
            )}

            {owned.map((fn) => (
              <button
                key={fn.id}
                type="button"
                className={cn(ACCESS_CONSOLE.row, selectedId === fn.id && ACCESS_CONSOLE.rowActive)}
                onClick={() => onPick({ kind: 'function', fn })}
              >
                <RowIcon icon={fn.icon} />
                <span
                  className={cn(ACCESS_CONSOLE.rowLabel, 'accent-text')}
                  style={accentVars(fn.accent, 'neutral')}
                >
                  {fn.name}
                </span>
              </button>
            ))}

            {canAdd && (
              <button
                type="button"
                className={ACCESS_CONSOLE.add}
                disabled={access.isSaving}
                onClick={() => setAddingTo(category)}
              >
                <Add className={ACCESS_CONSOLE.addIcon} aria-hidden="true" />
                {ACCESS_COPY.addFunction}
              </button>
            )}
          </div>
        )
      })}

      <Dialog
        open={addingTo !== null}
        onClose={() => setAddingTo(null)}
        title={ACCESS_COPY.addFunction}
        size="sm"
        footer={
          <>
            <Button onClick={() => setAddingTo(null)}>{ACCESS_COPY.cancel}</Button>
            <Button
              variant="primary"
              disabled={access.isSaving || name.trim().length === 0}
              onClick={() => void submit()}
            >
              {ACCESS_COPY.create}
            </Button>
          </>
        }
      >
        <Field id="new-function" label={ACCESS_COPY.newFunctionName}>
          <Input
            id="new-function"
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void submit()
            }}
          />
        </Field>
      </Dialog>
    </>
  )
}
