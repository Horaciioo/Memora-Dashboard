'use client'

import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { MultiSelect } from '@/components/elements/forms/MultiSelect'
import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import { LIST_STYLES } from '@/declarations/ui/variants'
import { LEAD_BLOCK } from '@/declarations/ui/blocks'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { LeadAnchor } from '@/types/access'
import type { FieldOption } from '@/types/forms'

export interface CreatorLeadsPanelProps {
  youtuberId: string
  initialAnchors: LeadAnchor[]
  candidates: FieldOption[]
  teams: FieldOption[]
  canManage: boolean
}

/**
 * Anchored responsables
 * @param {string} youtuberId - Creator identifier
 * @param {LeadAnchor[]} initialAnchors - Anchors resolved server-side
 * @param {FieldOption[]} candidates - Members the encadrement can be picked from
 * @param {FieldOption[]} teams - Teams an anchor may narrow to
 * @param {boolean} canManage - Viewer sits at admin level
 * @return {JSX.Element}
 */

export const CreatorLeadsPanel = ({
  youtuberId,
  initialAnchors,
  candidates,
  teams,
  canManage,
}: CreatorLeadsPanelProps) => {
  const { isSaving, run } = useMutation()
  const [anchors, setAnchors] = useState(initialAnchors)
  const [draft, setDraft] = useState(() => initialAnchors.map((anchor) => anchor.accountId))
  const [draftTeams, setDraftTeams] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(initialAnchors.map((anchor) => [anchor.accountId, anchor.teamId]))
  )

  const save = async (accountIds: string[], nextTeams: Record<string, string | null>) => {
    const next = await run(
      () =>
        apiPut<LeadAnchor[]>(API_ROUTES.creatorLeads(youtuberId), {
          accountIds,
          teams: nextTeams,
        }),
      REFERENCE_FIELD_COPY.leadsSaved
    )
    if (next) setAnchors(next)
  }

  const changeMembers = (accountIds: string[]) => {
    setDraft(accountIds)
    void save(accountIds, draftTeams)
  }

  const changeTeam = (accountId: string, teamId: string | null) => {
    const nextTeams = { ...draftTeams, [accountId]: teamId }
    setDraftTeams(nextTeams)
    void save(draft, nextTeams)
  }

  return (
    <div className={LEAD_BLOCK.panel}>
      {canManage ? (
        <MultiSelect
          id="creator-leads"
          value={draft}
          options={candidates}
          label={REFERENCE_FIELD_COPY.leads}
          emptyLabel={REFERENCE_FIELD_COPY.leadsEmptyTitle}
          mark="avatar"
          disabled={isSaving}
          onChange={changeMembers}
        />
      ) : (
        <p className={LEAD_BLOCK.note}>{REFERENCE_FIELD_COPY.leadsLocked}</p>
      )}

      {anchors.length === 0 ? (
        <EmptyState
          figure="teams"
          title={REFERENCE_FIELD_COPY.leadsEmptyTitle}
          description={REFERENCE_FIELD_COPY.leadsEmptyDescription}
          action={
            <span className={LEAD_BLOCK.note}>
              {canManage ? REFERENCE_FIELD_COPY.leadsHint : REFERENCE_FIELD_COPY.leadsLocked}
            </span>
          }
        />
      ) : (
        <div className={LIST_STYLES.stack}>
          {anchors.map((anchor) => {
            const role = ROLE_REGISTRY.get(anchor.role)

            return (
              <div key={anchor.accountId} className={LIST_STYLES.item}>
                <Avatar name={anchor.displayName} src={anchor.avatarUrl} size="sm" />
                <span className={LEAD_BLOCK.name}>{anchor.displayName}</span>
                <Badge label={role.label} accent={role.accent} tone="neutral" />
                {canManage ? (
                  <SelectMenu
                    id={`lead-team-${anchor.accountId}`}
                    value={draftTeams[anchor.accountId] ?? ''}
                    options={teams}
                    label={REFERENCE_FIELD_COPY.leadTeam}
                    emptyLabel={REFERENCE_FIELD_COPY.leadTeamAll}
                    size="compact"
                    disabled={isSaving}
                    onChange={(teamId) => changeTeam(anchor.accountId, teamId || null)}
                  />
                ) : (
                  <span className={LEAD_BLOCK.note}>
                    {anchor.teamName ?? REFERENCE_FIELD_COPY.leadTeamAll}
                  </span>
                )}
              </div>
            )
          })}
          {isSaving && <p className={LEAD_BLOCK.note}>{ACTION_COPY.saving}</p>}
        </div>
      )}
    </div>
  )
}
