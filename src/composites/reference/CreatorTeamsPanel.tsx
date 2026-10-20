'use client'

import { useMemo } from 'react'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { MultiSelect } from '@/components/elements/forms/selects/MultiSelect'
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
 * Teams of a creator: switch them on, then seat each moderator
 * @param {string} youtuberId - Creator identifier
 * @param {CreatorTeamData} initial - Data resolved server-side
 * @param {boolean} canManage - Viewer may change teams
 * @return {JSX.Element}
 */

export const CreatorTeamsPanel = ({ youtuberId, initial, canManage }: CreatorTeamsPanelProps) => {
  const { data, isSaving, setEnabled, setMemberTeams } = useCreatorTeams(initial, youtuberId)

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
          onChange={setEnabled}
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
            <CreatorMemberBox
              key={member.person.id}
              member={member}
              options={seatOptions}
              canManage={canManage}
              isSaving={isSaving}
              onChange={(functionIds) => setMemberTeams(member.person.id, functionIds)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
