'use client'

import { useMemo, useState } from 'react'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { MultiSelect } from '@/components/elements/forms/selects/MultiSelect'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { CreatorMemberBox } from '@/composites/reference/CreatorMemberBox'
import { useCreatorTeams } from '@/core/hooks/data/people/useCreatorTeams'
import { TEAM_COPY } from '@/declarations/teams/copy'
import { CREATOR_FILE } from '@/declarations/ui/blocks'
import type { FieldOption } from '@/types/forms'
import type { CreatorTeamData } from '@/types/teams'

export interface CreatorTeamsPanelProps {
  youtuberId: string
  initial: CreatorTeamData
  canManage: boolean
}

/**
 * Functions of a creator, all open, with who holds each
 * @param {string} youtuberId - Creator identifier
 * @param {CreatorTeamData} initial - Data resolved server-side
 * @param {boolean} canManage - Viewer may close a function, the root administrator alone
 * @return {JSX.Element}
 */

export const CreatorTeamsPanel = ({ youtuberId, initial, canManage }: CreatorTeamsPanelProps) => {
  const { data, isSaving, setEnabled } = useCreatorTeams(initial, youtuberId)
  // Closing a function waits for a second look
  const [closing, setClosing] = useState<string[] | null>(null)

  // Principal ones first
  const toOption = (entry: CreatorTeamData['functions'][number]): FieldOption => ({
    value: entry.id,
    label: entry.name,
    icon: entry.icon,
    accent: entry.accent ?? undefined,
    group: entry.isPrimary ? TEAM_COPY.primary : TEAM_COPY.secondary,
  })

  const allOptions = useMemo(
    () =>
      [...data.functions].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)).map(toOption),
    [data.functions]
  )
  const enabledIds = data.functions.filter((entry) => entry.isEnabled).map((entry) => entry.id)
  const seatOptions = allOptions.filter((option) => enabledIds.includes(option.value))

  return (
    <div className={CREATOR_FILE.stack}>
      {canManage && (
        <MultiSelect
          id="creator-enabled-teams"
          value={enabledIds}
          options={allOptions}
          label={TEAM_COPY.enabled}
          emptyLabel={TEAM_COPY.enabledEmpty}
          mark="glyph"
          disabled={isSaving}
          onChange={(next) =>
            next.length < enabledIds.length ? setClosing(next) : setEnabled(next)
          }
        />
      )}

      {data.members.length === 0 ? (
        <EmptyState
          figure="teams"
          title={TEAM_COPY.noMembers}
          description={TEAM_COPY.noMembersHint}
          action={null}
        />
      ) : seatOptions.length === 0 ? (
        <p className={CREATOR_FILE.empty}>{TEAM_COPY.noFunctions}</p>
      ) : (
        <div className={CREATOR_FILE.grid}>
          {data.members.map((member) => (
            <CreatorMemberBox key={member.person.id} member={member} options={seatOptions} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={closing !== null}
        title={TEAM_COPY.closeWarningTitle}
        description={TEAM_COPY.closeWarningDescription}
        pending={isSaving}
        onConfirm={() => {
          if (closing) setEnabled(closing)
          setClosing(null)
        }}
        onCancel={() => setClosing(null)}
      />
    </div>
  )
}
