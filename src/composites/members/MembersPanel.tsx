'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/structures/DataTable'
import { FilterBar, type FilterDefinition } from '@/components/structures/FilterBar'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { useMembers } from '@/core/hooks/data/useMembers'
import { ROLE_REGISTRY, MEMBER_STATUS_REGISTRY } from '@/declarations/access/roles'
import { MEMBER_COPY, MEMBER_FILTER_COPY } from '@/declarations/members/copy'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY, FIELD_COPY } from '@/declarations/ui/copy'
import { DivisionBadge, MemberStatusBadge, RoleBadge } from '@/composites/members/MemberBadges'
import type { MenuItem } from '@/managers/front-end'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { MemberSummary } from '@/types/members'
import { formatDay } from '@/utils/format/dates'

export interface MembersPanelProps {
  initialMembers: MemberSummary[]
  fields: FieldDefinition[]
  divisions: FieldOption[]
  youtubers: FieldOption[]
  functions: FieldOption[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

/**
 * Moderator list with its filters, its creation dialog and a right click menu per row
 * @param {MemberSummary[]} initialMembers - Rows resolved server-side
 * @param {FieldDefinition[]} fields - Field declarations of the moderator form
 * @param {FieldOption[]} divisions - Division filter options
 * @param {FieldOption[]} youtubers - YouTuber filter options
 * @param {FieldOption[]} functions - Function filter options
 * @param {boolean} canCreate - Member may add a moderator
 * @param {boolean} canUpdate - Member may edit a moderator
 * @param {boolean} canDelete - Member may drop a moderator
 * @return {JSX.Element}
 */

export const MembersPanel = ({
  initialMembers,
  fields,
  divisions,
  youtubers,
  functions,
  canCreate,
  canUpdate,
  canDelete,
}: MembersPanelProps) => {
  const router = useRouter()
  const { members, isSaving, issues, create, remove, clearIssues } = useMembers(initialMembers)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [isCreating, setCreating] = useState(false)
  const [pendingDeletion, setPendingDeletion] = useState<MemberSummary | null>(null)

  const isFiltered =
    search.trim().length > 0 || Object.values(filters).some((value) => value.length > 0)

  const visibleMembers = useMemo(() => {
    const term = search.trim().toLowerCase()

    return members.filter((member) => {
      // Free text runs on the name and on the Discord identifier
      if (
        term.length > 0 &&
        !member.displayName.toLowerCase().includes(term) &&
        !member.discordId.includes(term)
      ) {
        return false
      }

      if (filters.role && member.role !== filters.role) return false
      if (filters.status && member.status !== filters.status) return false
      if (filters.division && member.division?.id !== filters.division) return false
      if (filters.youtuber && member.youtuber?.id !== filters.youtuber) return false
      if (
        filters.jobFunction &&
        member.primaryFunction?.id !== filters.jobFunction &&
        member.secondaryFunction?.id !== filters.jobFunction
      ) {
        return false
      }

      return true
    })
  }, [members, search, filters])

  const filterDefinitions: FilterDefinition[] = [
    {
      name: 'role',
      label: MEMBER_FILTER_COPY.role,
      allLabel: MEMBER_FILTER_COPY.allRoles,
      options: ROLE_REGISTRY.keys.map((key) => ({
        value: key,
        label: ROLE_REGISTRY.label(key),
      })),
    },
    {
      name: 'status',
      label: MEMBER_FILTER_COPY.status,
      allLabel: MEMBER_FILTER_COPY.allStatuses,
      options: MEMBER_STATUS_REGISTRY.keys.map((key) => ({
        value: key,
        label: MEMBER_STATUS_REGISTRY.label(key),
      })),
    },
    {
      name: 'division',
      label: MEMBER_FILTER_COPY.division,
      allLabel: MEMBER_FILTER_COPY.allDivisions,
      options: divisions,
    },
    {
      name: 'youtuber',
      label: MEMBER_FILTER_COPY.youtuber,
      allLabel: MEMBER_FILTER_COPY.allYoutubers,
      options: youtubers,
    },
    {
      name: 'jobFunction',
      label: MEMBER_FILTER_COPY.jobFunction,
      allLabel: MEMBER_FILTER_COPY.allFunctions,
      options: functions,
    },
  ]

  const columns: DataTableColumn<MemberSummary>[] = [
    {
      key: 'displayName',
      header: FIELD_COPY.name,
      sortValue: (member) => member.displayName.toLowerCase(),
      render: (member) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={member.displayName} src={member.avatarUrl} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{member.displayName}</span>
            <span className="truncate text-xs text-[var(--color-ink-subtle)]">
              {member.discordId}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'division',
      header: FIELD_COPY.division,
      sortValue: (member) => member.division?.rank ?? -1,
      render: (member) => <DivisionBadge division={member.division} />,
    },
    {
      key: 'role',
      header: FIELD_COPY.role,
      sortValue: (member) => ROLE_REGISTRY.get(member.role).rank,
      render: (member) => <RoleBadge member={member} />,
    },
    {
      key: 'youtuber',
      header: FIELD_COPY.youtuber,
      sortValue: (member) => member.youtuber?.label ?? '',
      render: (member) =>
        member.youtuber ? (
          <Badge label={member.youtuber.label} tone="info" icon="youtuber" />
        ) : (
          <span className="text-xs text-[var(--color-ink-subtle)]">{MEMBER_COPY.noYoutuber}</span>
        ),
    },
    {
      key: 'functions',
      header: FIELD_COPY.mainFunction,
      render: (member) => (
        <span className="flex flex-wrap gap-1.5">
          {member.primaryFunction && <Badge label={member.primaryFunction.label} tone="brand" />}
          {member.secondaryFunction && (
            <Badge label={member.secondaryFunction.label} tone="neutral" />
          )}
          {!member.primaryFunction && !member.secondaryFunction && (
            <span className="text-xs text-[var(--color-ink-subtle)]">{MEMBER_COPY.noFunction}</span>
          )}
        </span>
      ),
    },
    {
      key: 'status',
      header: FIELD_COPY.status,
      sortValue: (member) => member.status,
      render: (member) => <MemberStatusBadge member={member} />,
    },
    {
      key: 'joinedAt',
      header: FIELD_COPY.joinedAt,
      sortValue: (member) => member.joinedAt,
      className: 'whitespace-nowrap',
      render: (member) => formatDay(member.joinedAt),
    },
  ]

  const rowMenu = (member: MemberSummary): MenuItem[] => [
    {
      id: 'open',
      label: ACTION_COPY.open,
      icon: 'forward',
      onSelect: () => router.push(ROUTES.member(member.id)),
    },
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canUpdate || member.isRoot,
      onSelect: () => router.push(ROUTES.member(member.id)),
    },
    {
      id: 'copy',
      label: ACTION_COPY.copyLink,
      icon: 'copy',
      onSelect: () => void navigator.clipboard.writeText(member.discordId),
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canDelete || member.isRoot,
      onSelect: () => setPendingDeletion(member),
    },
  ]

  const openCreate = () => {
    clearIssues()
    setCreating(true)
  }

  return (
    <>
      <Section bare>
        <FilterBar
          searchLabel={MEMBER_FILTER_COPY.search}
          search={search}
          onSearch={setSearch}
          filters={filterDefinitions}
          values={filters}
          onFilter={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
          onReset={() => {
            setSearch('')
            setFilters({})
          }}
          isFiltered={isFiltered}
          summary={`${visibleMembers.length} ${
            visibleMembers.length === 1 ? MEMBER_FILTER_COPY.countOne : MEMBER_FILTER_COPY.count
          }`}
        />
        <DataTable
          columns={columns}
          rows={visibleMembers}
          getRowId={(member) => member.id}
          onRowOpen={(member) => router.push(ROUTES.member(member.id))}
          rowMenu={rowMenu}
          emptyState={
            isFiltered
              ? {
                  variant: 'filter',
                  title: MEMBER_COPY.filterTitle,
                  description: MEMBER_COPY.filterDescription,
                  action: (
                    <Button
                      onClick={() => {
                        setSearch('')
                        setFilters({})
                      }}
                    >
                      {ACTION_COPY.clearFilter}
                    </Button>
                  ),
                }
              : {
                  variant: 'start',
                  figure: 'members',
                  title: MEMBER_COPY.emptyTitle,
                  description: MEMBER_COPY.emptyDescription,
                  action: (
                    <Button variant="primary" icon="add" onClick={openCreate} disabled={!canCreate}>
                      {MEMBER_COPY.add}
                    </Button>
                  ),
                }
          }
        />
        {visibleMembers.length > 0 && canCreate && (
          <AddRow label={MEMBER_COPY.add} onClick={openCreate} />
        )}
      </Section>

      <FormDialog
        open={isCreating}
        title={MEMBER_COPY.add}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        size="lg"
        onSubmit={create}
        onClose={() => setCreating(false)}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={MEMBER_COPY.deleteTitle}
        description={MEMBER_COPY.deleteDescription}
        pending={isSaving}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={async () => {
          await remove(pendingDeletion!.id)
          setPendingDeletion(null)
        }}
      />
    </>
  )
}
