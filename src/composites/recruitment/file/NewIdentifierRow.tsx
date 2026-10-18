'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/inputs/Input'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { toOptions } from '@/core/lib/forms/options'
import { snowflakeOf } from '@/core/lib/discord/identifiers'
import { DISCORD_ID_COPY } from '@/declarations/discord/copy'
import { DISCORD_ID_KIND_REGISTRY, kindOfToken } from '@/declarations/discord/registries'
import { PLANNING_COPY } from '@/declarations/recruitment/copy'
import { ANNOUNCEMENT_DRAWER } from '@/declarations/ui/variants'
import type { FormValues } from '@/types/forms'

const KIND_OPTIONS = toOptions(DISCORD_ID_KIND_REGISTRY)

export interface NewIdentifierRowProps {
  token: string
  isSaving: boolean
  onStore: (values: FormValues) => Promise<boolean>
}

/**
 * Unknown identifier offered for storage
 * @param {string} token - Mention token met in the text
 * @param {boolean} isSaving - Storage in flight
 * @param {(values: FormValues) => Promise<boolean>} onStore - Storage handler
 * @return {JSX.Element}
 */

export const NewIdentifierRow = ({ token, isSaving, onStore }: NewIdentifierRowProps) => {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<string>(kindOfToken(token))

  return (
    <div className={ANNOUNCEMENT_DRAWER.newRow}>
      <code className={ANNOUNCEMENT_DRAWER.newToken}>{token}</code>
      <Input
        aria-label={PLANNING_COPY.identifierName}
        placeholder={PLANNING_COPY.identifierName}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <SelectMenu
        label={DISCORD_ID_COPY.kind}
        options={KIND_OPTIONS}
        value={kind}
        onChange={setKind}
      />
      <Button
        variant="primary"
        disabled={name.trim() === '' || isSaving}
        onClick={() => void onStore({ name: name.trim(), kind, discordId: snowflakeOf(token) })}
      >
        {PLANNING_COPY.identifierSave}
      </Button>
    </div>
  )
}
