'use client'

import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { ENCADREMENT_ROLES, ROLE_REGISTRY } from '@/declarations/access/roles'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import { CREATOR_FILE, LEAD_BLOCK } from '@/declarations/ui/blocks'
import type { LeadAnchor } from '@/types/access'
import type { FieldOption } from '@/types/forms'

// Levels an anchor can sit at
const ROLE_OPTIONS: FieldOption[] = ENCADREMENT_ROLES.map((role) => ({
  value: role,
  label: ROLE_REGISTRY.get(role).label,
}))

export interface CreatorLeadsPanelProps {
  youtuberId: string
  initialAnchors: LeadAnchor[]
  canManage: boolean
  // One row per line, for a narrow column
  isStacked?: boolean
}

/**
 * Anchored responsables: bare rows, the level of each a menu for an admin
 * @param {string} youtuberId - Creator identifier
 * @param {LeadAnchor[]} initialAnchors - Anchors resolved server-side
 * @param {boolean} canManage - Viewer sits at admin level
 * @param {boolean} [isStacked] - One row per line
 * @return {JSX.Element}
 */

export const CreatorLeadsPanel = ({
  youtuberId,
  initialAnchors,
  canManage,
  isStacked,
}: CreatorLeadsPanelProps) => {
  const { isSaving, run } = useMutation()
  const [anchors, setAnchors] = useState(initialAnchors)

  const changeRole = async (accountId: string, role: string) => {
    const next = await run(
      () => apiPatch<LeadAnchor[]>(API_ROUTES.creatorLeads(youtuberId), { accountId, role }),
      REFERENCE_FIELD_COPY.leadsSaved
    )
    if (next) setAnchors(next)
  }

  if (anchors.length === 0) {
    return <p className={LEAD_BLOCK.note}>{REFERENCE_FIELD_COPY.leadsEmptyTitle}</p>
  }

  return (
    <div className={isStacked ? CREATOR_FILE.column : CREATOR_FILE.grid}>
      {anchors.map((anchor) => {
        const role = ROLE_REGISTRY.get(anchor.role)

        return (
          <div key={anchor.accountId} className={LEAD_BLOCK.row}>
            <Avatar name={anchor.displayName} src={anchor.avatarUrl} size="md" />
            <span className={LEAD_BLOCK.name}>{anchor.displayName}</span>
            {canManage ? (
              <SelectMenu
                options={ROLE_OPTIONS}
                value={anchor.role}
                label={REFERENCE_FIELD_COPY.leads}
                size="compact"
                mark="role"
                isMarkOnly
                disabled={isSaving}
                onChange={(value) => void changeRole(anchor.accountId, value)}
              />
            ) : (
              <Status label={role.label} accent={role.accent} tone="neutral" />
            )}
          </div>
        )
      })}
    </div>
  )
}
