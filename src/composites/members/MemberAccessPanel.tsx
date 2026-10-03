'use client'

import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { Field } from '@/components/elements/forms/Field'
import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { PermissionBoard } from '@/components/structures/PermissionBoard'
import { Section } from '@/components/structures/Section'
import { countChanges, fromDraft, toDraft } from '@/core/lib/permissions'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { layerKey } from '@/core/lib/permissions'
import type { PermissionDraft, PermissionLayers, PermissionOverwrite } from '@/core/lib/permissions'
import type { MemberTag } from '@/types/members'
import type { PermissionName } from '@/utils/constants/permissions'

export interface MemberAccessPanelProps {
  overrides: PermissionLayers
  inherited: Record<string, PermissionName[]>
  youtubers: MemberTag[]
  sealed: boolean
  isSaving: boolean
  onSave: (next: PermissionOverwrite[], youtuberId: string | null) => Promise<boolean>
  onSealed: () => void
}

/**
 * Per-account overwrites, on top of what the role and the functions already grant. A layer
 * is picked first: the global one, or one of the creators the member is actually attached to
 * @param {PermissionLayers} overrides - Stored overwrites, per layer
 * @param {Record<string, PermissionName[]>} inherited - What inheritance grants, per layer
 * @param {MemberTag[]} youtubers - Creators the member is attached to
 * @param {boolean} sealed - The second factor still has to be opened before writing
 * @param {boolean} isSaving - Mutation in flight
 * @param {(next: PermissionOverwrite[], youtuberId: string | null) => Promise<boolean>} onSave - Save handler
 * @param {() => void} onSealed - Asks for the code rather than attempting the write
 * @return {JSX.Element}
 */

export const MemberAccessPanel = ({
  overrides,
  inherited,
  youtubers,
  sealed,
  isSaving,
  onSave,
  onSealed,
}: MemberAccessPanelProps) => {
  const [layer, setLayer] = useState('')
  const saved = toDraft(overrides[layer] ?? [])
  const [drafts, setDrafts] = useState<Record<string, PermissionDraft>>({})

  const draft = drafts[layer] ?? saved
  const pending = countChanges(draft, saved)

  const options = [
    { value: '', label: ACCESS_COPY.layerGlobal },
    ...youtubers.map((creator) => ({
      value: creator.id,
      label: creator.label,
      accent: creator.accent ?? undefined,
    })),
  ]

  return (
    <Section
      title={MEMBER_COPY.accessTitle}
      description={MEMBER_COPY.accessLead}
      action={
        <>
          <MaturityTag maturity="beta" />
          <Button
            variant="primary"
            icon="confirm"
            disabled={pending === 0}
            isLoading={isSaving}
            onClick={() =>
              sealed ? onSealed() : void onSave(fromDraft(draft), layer === '' ? null : layer)
            }
          >
            {isSaving ? ACTION_COPY.saving : MEMBER_COPY.accessSave}
          </Button>
        </>
      }
      padded
    >
      <div className="flex flex-col gap-4">
        {youtubers.length > 0 && (
          <Field
            id="access-layer"
            label={ACCESS_COPY.layerLabel}
            hint={layer === '' ? undefined : ACCESS_COPY.layerLead}
          >
            <SelectMenu
              id="access-layer"
              label={ACCESS_COPY.layerLabel}
              options={options}
              value={layer}
              mark="dot"
              onChange={setLayer}
            />
          </Field>
        )}

        <PermissionBoard
          value={draft}
          baseline={inherited[layerKey(layer === '' ? null : layer)] ?? []}
          pending={pending}
          onChange={(next) => setDrafts((current) => ({ ...current, [layer]: next }))}
        />
      </div>
    </Section>
  )
}
