'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { FormRenderer } from '@/components/structures/data/FormRenderer'
import { SealedValue } from '@/components/structures/inline/SealedValue'
import { SettingsGroup } from '@/composites/preferences/SettingsGroup'
import type { ProfileState } from '@/core/hooks/data/people/useProfile'
import { SENSITIVE_FIELD_REGISTRY, isSensitiveField } from '@/declarations/access/sensitive'
import type { SensitiveFieldName } from '@/declarations/access/sensitive'
import { PROFILE_SECTIONS, SETTINGS_GROUP_COPY } from '@/declarations/preferences/settings'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { DETAIL_BLOCK } from '@/declarations/ui/blocks'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'
import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'

export interface ProfileTabProps {
  state: ProfileState
  fields: FieldDefinition[]
  initialValues: FormValues
}

/**
 * Own file: the sealed details, then the editable fields by category
 * @param {ProfileState} state - File and its mutation
 * @param {FieldDefinition[]} fields - Declarations of the editable fields
 * @param {FormValues} initialValues - Values feeding the form
 * @return {JSX.Element}
 */

export const ProfileTab = ({ state, fields, initialValues }: ProfileTabProps) => {
  const { factor } = useSeal()
  const [draft, setDraft] = useState<FormValues>(initialValues)

  const change = (name: string, value: FieldValue) =>
    setDraft((current) => ({ ...current, [name]: value }))

  // A sealed value never reaches the form engine
  const isSealed = !factor.seal.isUnsealed
  const ownedFields = fields.filter((field) => !(isSealed && isSensitiveField(field.name)))
  const sealedNames = isSealed
    ? fields
        .map((field) => field.name)
        .filter((name): name is SensitiveFieldName => isSensitiveField(name))
    : []

  return (
    <div className={PREFERENCE_STYLES.stack}>
      {sealedNames.length > 0 && (
        <SettingsGroup title={SETTINGS_GROUP_COPY.sealedTitle}>
          <dl className={DETAIL_BLOCK.grid}>
            {sealedNames.map((name) => (
              <div key={name} className={DETAIL_BLOCK.entry}>
                <dt className={DETAIL_BLOCK.label}>{SENSITIVE_FIELD_REGISTRY.label(name)}</dt>
                <dd className={DETAIL_BLOCK.value}>
                  <SealedValue field={name} />
                </dd>
              </div>
            ))}
          </dl>
        </SettingsGroup>
      )}
      {PROFILE_SECTIONS.map((section) => (
        <SettingsGroup key={section.title} title={section.title}>
          <FormRenderer
            fields={ownedFields.filter((field) =>
              (section.fields as readonly string[]).includes(field.name)
            )}
            values={draft}
            issues={state.issues}
            onChange={change}
            disabled={state.isSaving}
            idPrefix={`profile-${section.fields[0]}`}
          />
        </SettingsGroup>
      ))}
      <Button
        variant="primary"
        icon="confirm"
        disabled={state.isSaving}
        onClick={() => void state.save(draft)}
      >
        {state.isSaving ? ACTION_COPY.saving : SETTINGS_GROUP_COPY.save}
      </Button>
    </div>
  )
}
