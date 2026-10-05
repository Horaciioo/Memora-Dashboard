'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ColourField } from '@/components/elements/forms/ColourField'
import { Field } from '@/components/elements/forms/Field'
import { IconPicker } from '@/components/elements/forms/IconPicker'
import { Input } from '@/components/elements/forms/Input'
import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { ACCESS_CATEGORY_REGISTRY } from '@/declarations/access/categories'
import { FUNCTION_KIND_REGISTRY } from '@/declarations/reference/registries'
import { ACCESS_CONSOLE } from '@/declarations/ui/blocks'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { toOptions } from '@/core/lib/forms/options'
import type { AccessCollection } from '@/core/hooks/data/useAccess'
import type { AccessSelection } from '@/composites/access/AccessConsole'
import { AccessCategories } from '@/utils/constants/hierarchy'
import type { AccessCategoryName } from '@/utils/constants/hierarchy'
import { FunctionKinds } from '@/utils/constants/workflow'
import type { FunctionKindName } from '@/utils/constants/workflow'

export interface RoleDisplayTabProps {
  selection: AccessSelection
  access: AccessCollection
  onDeleted: () => void
}

/**
 * Display tab — name
 * @param {AccessSelection} selection - Role or function on screen
 * @param {AccessCollection} access - Console state and mutations
 * @param {() => void} onDeleted - Called once a function is removed
 * @return {JSX.Element}
 */

export const RoleDisplayTab = ({ selection, access, onDeleted }: RoleDisplayTabProps) => {
  const isFunction = selection.kind === 'function'
  const source =
    selection.kind === 'role'
      ? { name: selection.role.label, accent: selection.role.accent, icon: selection.role.icon }
      : {
          name: selection.fn.name,
          accent: selection.fn.accent,
          icon: selection.fn.icon,
        }

  const [name, setName] = useState(source.name)
  const [accent, setAccent] = useState<string | null>(source.accent)
  const [icon, setIcon] = useState<string | null>(source.icon)
  const [kind, setKind] = useState<FunctionKindName>(
    selection.kind === 'function' ? selection.fn.kind : FunctionKinds.Primary
  )
  const [summary, setSummary] = useState(
    selection.kind === 'function' ? (selection.fn.summary ?? '') : ''
  )
  const [category, setCategory] = useState<AccessCategoryName>(
    selection.kind === 'function' ? selection.fn.category : AccessCategories.Moderation
  )
  const [confirming, setConfirming] = useState(false)

  const locked = selection.kind === 'role' && selection.role.locked

  const save = () => {
    if (selection.kind === 'role') {
      void access.saveRoleAppearance(selection.role.role, { accent, icon })

      return
    }

    void access.updateFunction(selection.fn.id, {
      name: name.trim(),
      category,
      kind,
      accent,
      icon,
      summary: summary.trim() || null,
    })
  }

  return (
    <div className={ACCESS_CONSOLE.form}>
      <Field
        id="role-name"
        label={ACCESS_COPY.displayNameLabel}
        hint={isFunction ? undefined : ACCESS_COPY.displayNameLocked}
      >
        <Input
          id="role-name"
          value={name}
          disabled={!isFunction || locked}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>

      <Field id="role-accent" label={ACCESS_COPY.displayAccentLabel}>
        <ColourField
          id="role-accent"
          label={ACCESS_COPY.displayAccentLabel}
          value={accent ?? ''}
          disabled={locked}
          onChange={setAccent}
        />
      </Field>

      <Field id="role-icon" label={ACCESS_COPY.displayIconLabel}>
        <IconPicker
          id="role-icon"
          label={ACCESS_COPY.displayIconLabel}
          value={icon}
          disabled={locked}
          onChange={setIcon}
        />
      </Field>

      {isFunction && (
        <>
          <Field id="role-category" label={ACCESS_COPY.displayCategoryLabel}>
            <SelectMenu
              id="role-category"
              label={ACCESS_COPY.displayCategoryLabel}
              options={toOptions(ACCESS_CATEGORY_REGISTRY)}
              value={category}
              onChange={(next) => setCategory(next as AccessCategoryName)}
            />
          </Field>

          <Field id="role-kind" label={ACCESS_COPY.displayKindLabel}>
            <SelectMenu
              id="role-kind"
              label={ACCESS_COPY.displayKindLabel}
              options={toOptions(FUNCTION_KIND_REGISTRY)}
              value={kind}
              onChange={(next) => setKind(next as FunctionKindName)}
            />
          </Field>

          <Field id="role-summary" label={ACCESS_COPY.displaySummaryLabel}>
            <Input
              id="role-summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </Field>
        </>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          icon="confirm"
          disabled={access.isSaving || locked}
          onClick={save}
        >
          {access.isSaving ? ACTION_COPY.saving : ACCESS_COPY.save}
        </Button>
        {isFunction && (
          <Button
            variant="danger"
            icon="remove"
            disabled={access.isSaving || selection.fn.holders > 0}
            onClick={() => setConfirming(true)}
          >
            {ACCESS_COPY.deleteFunction}
          </Button>
        )}
        {isFunction && selection.fn.holders > 0 && (
          <span className={ACCESS_CONSOLE.detailKind}>{ACCESS_COPY.deleteBlocked}</span>
        )}
      </div>

      {selection.kind === 'function' && (
        <ConfirmDialog
          open={confirming}
          title={ACCESS_COPY.deleteFunctionTitle}
          description={ACCESS_COPY.deleteFunctionLead}
          confirmLabel={ACCESS_COPY.deleteFunction}
          pending={access.isSaving}
          onCancel={() => setConfirming(false)}
          onConfirm={async () => {
            const next = await access.deleteFunction(selection.fn.id)
            setConfirming(false)
            if (next) onDeleted()
          }}
        />
      )}
    </div>
  )
}
