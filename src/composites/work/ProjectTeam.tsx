'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { PROJECT_SETTINGS } from '@/declarations/configurations/settings'
import { PROJECT_COPY } from '@/declarations/work/copy'
import type { FieldOption } from '@/types/forms'
import type { WorkPerson } from '@/types/work'

export interface ProjectTeamProps {
  leads: WorkPerson[]
  assistants: WorkPerson[]
  leadOptions: FieldOption[]
  assistantOptions: FieldOption[]
  disabled?: boolean
  isSaving?: boolean
  onSave: (patch: { leadIds: string[]; assistantIds: string[] }) => Promise<boolean>
}

interface RosterProps {
  title: string
  people: WorkPerson[]
  options: FieldOption[]
  disabled: boolean
  full: boolean
  onChange: (ids: string[]) => void
}

/**
 * One editable roster inside the team box
 * @param {string} title - Group label
 * @param {WorkPerson[]} people - Current members
 * @param {FieldOption[]} options - People that may be added
 * @param {boolean} disabled - Blocks every gesture
 * @param {boolean} full - Hides the add control once the cap is reached
 * @param {(ids: string[]) => void} onChange - Persists the new id list
 * @return {JSX.Element}
 */

const Roster = ({ title, people, options, disabled, full, onChange }: RosterProps) => {
  const ids = people.map((person) => person.id)
  const rest = options.filter((option) => !ids.includes(option.value))

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {people.map((person) => (
          <span key={person.id} className="group flex items-center gap-1.5 text-sm">
            <Avatar name={person.name} src={person.src} size="sm" />
            <span className="font-medium">{person.name}</span>
            <Button
              variant="icon"
              icon="close"
              aria-label={PROJECT_COPY.teamRemove}
              disabled={disabled}
              onClick={() => onChange(ids.filter((id) => id !== person.id))}
              className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            />
          </span>
        ))}
        {people.length === 0 && (
          <span className="text-sm text-[var(--color-ink-subtle)] italic">
            {PROJECT_COPY.teamEmpty}
          </span>
        )}
        {!full && (
          <SelectMenu
            options={rest}
            value=""
            onChange={(id) => id && onChange([...ids, id])}
            label={PROJECT_COPY.teamAdd}
            placeholder={PROJECT_COPY.teamAdd}
            mark="avatar"
            size="compact"
            disabled={disabled}
            className="border-transparent bg-transparent px-1 hover:border-transparent hover:bg-transparent"
          />
        )}
      </div>
    </div>
  )
}

/**
 * Team box of a project file
 * @param {WorkPerson[]} leads - Current responsables
 * @param {WorkPerson[]} assistants - Current assistants
 * @param {FieldOption[]} leadOptions - People that may lead
 * @param {FieldOption[]} assistantOptions - People that may assist
 * @param {boolean} [disabled] - Blocks every gesture
 * @param {boolean} [isSaving] - Mutation in flight
 * @param {(patch: { leadIds: string[], assistantIds: string[] }) => Promise<boolean>} onSave - Persists the team
 * @return {JSX.Element}
 */

export const ProjectTeam = ({
  leads,
  assistants,
  leadOptions,
  assistantOptions,
  disabled,
  isSaving,
  onSave,
}: ProjectTeamProps) => {
  const busy = Boolean(disabled) || Boolean(isSaving)
  const assistantIds = assistants.map((person) => person.id)
  const leadIds = leads.map((person) => person.id)

  // Nobody sits in both rosters, so each list drops whoever the other already holds
  const freeLeadOptions = leadOptions.filter((option) => !assistantIds.includes(option.value))
  const freeAssistantOptions = assistantOptions.filter((option) => !leadIds.includes(option.value))

  return (
    <div className="flex flex-col gap-5">
      <Roster
        title={PROJECT_COPY.responsables}
        people={leads}
        options={freeLeadOptions}
        disabled={busy}
        full={leads.length >= PROJECT_SETTINGS.leadMax}
        onChange={(ids) => void onSave({ leadIds: ids, assistantIds })}
      />
      <Roster
        title={PROJECT_COPY.assistants}
        people={assistants}
        options={freeAssistantOptions}
        disabled={busy}
        full={false}
        onChange={(ids) => void onSave({ leadIds, assistantIds: ids })}
      />
    </div>
  )
}
