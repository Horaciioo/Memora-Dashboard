'use client'

import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { Button } from '@/components/elements/actions/Button'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { apiDelete, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { WHITELIST_COPY } from '@/declarations/intelligence/whitelist'
import { LEAD_BLOCK } from '@/declarations/ui/blocks'
import type { WhitelistState } from '@/types/access'

export interface WhitelistPanelProps {
  initial: WhitelistState
  canManage: boolean
}

/**
 * Whitelist of Memora Intelligence: ranks admitted by default, listed members an admin edits
 * @param {WhitelistState} initial - List resolved server-side
 * @param {boolean} canManage - Viewer sits at admin level
 * @return {JSX.Element}
 */

export const WhitelistPanel = ({ initial, canManage }: WhitelistPanelProps) => {
  const { isSaving, run } = useMutation()
  const [state, setState] = useState(initial)

  const add = async (accountId: string) => {
    const next = await run(
      () => apiPost<WhitelistState>(API_ROUTES.whitelist, { accountId }),
      WHITELIST_COPY.added
    )
    if (next) setState(next)
  }

  const remove = async (accountId: string) => {
    const next = await run(
      () => apiDelete<WhitelistState>(API_ROUTES.whitelist, { accountId }),
      WHITELIST_COPY.removed
    )
    if (next) setState(next)
  }

  return (
    <div className={LEAD_BLOCK.panel}>
      {state.entries.map((entry) => {
        const role = ROLE_REGISTRY.get(entry.role)

        return (
          <div key={entry.accountId} className={LEAD_BLOCK.row}>
            <Avatar name={entry.displayName} src={entry.avatarUrl} size="md" />
            <span className={LEAD_BLOCK.name}>{entry.displayName}</span>
            {entry.isAutomatic ? (
              <Status
                label={`${role.label} · ${WHITELIST_COPY.automatic}`}
                accent={role.accent}
                tone="neutral"
              />
            ) : (
              canManage && (
                <Button
                  variant="ghost"
                  disabled={isSaving}
                  onClick={() => void remove(entry.accountId)}
                >
                  {WHITELIST_COPY.remove}
                </Button>
              )
            )}
          </div>
        )
      })}
      {canManage ? (
        <SelectMenu
          options={state.candidates.map((candidate) => ({
            value: candidate.accountId,
            label: candidate.displayName,
          }))}
          value=""
          label={WHITELIST_COPY.addLabel}
          placeholder={
            state.candidates.length > 0 ? WHITELIST_COPY.add : WHITELIST_COPY.noCandidate
          }
          disabled={isSaving || state.candidates.length === 0}
          onChange={(value) => value && void add(value)}
        />
      ) : (
        <p className={LEAD_BLOCK.note}>{WHITELIST_COPY.readOnly}</p>
      )}
    </div>
  )
}
