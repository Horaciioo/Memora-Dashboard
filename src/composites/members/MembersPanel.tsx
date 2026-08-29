'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FilterBar, type FilterDefinition } from '@/components/structures/FilterBar'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { useMembers } from '@/core/hooks/data/useMembers'
import { toOptions } from '@/core/lib/forms/options'
import { ROLE_REGISTRY, MEMBER_STATUS_REGISTRY } from '@/declarations/access/roles'
import { MEMBER_COPY, MEMBER_FILTER_COPY } from '@/declarations/members/copy'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { GROUP_STYLES, LIST_STYLES } from '@/declarations/ui/variants'
import { MemberCard } from '@/composites/members/MemberCard'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { MemberSummary } from '@/types/members'
import { cn } from '@/utils/classnames'

export interface MembersPanelProps {
  initialMembers: MemberSummary[]
  fields: FieldDefinition[]
  divisions: FieldOption[]
  youtubers: FieldOption[]
  functions: FieldOption[]
  canCreate: boolean
  canDelete: boolean
  canReadNotes: boolean
}

/**
 * Moderator boxes, categorised by YouTuber
 * @param {MemberSummary[]} initialMembers - Rows resolved server-side
 * @param {FieldDefinition[]} fields - Field declarations of the moderator form
 * @param {FieldOption[]} divisions - Division filter options
 * @param {FieldOption[]} youtubers - YouTuber filter options and group order
 * @param {FieldOption[]} functions - Function filter options
 * @param {boolean} canCreate - Member may add a moderator
 * @param {boolean} canDelete - Member may drop a moderator
 * @param {boolean} canReadNotes - Member may see the notes indicator
 * @return {JSX.Element}
 */

export const MembersPanel = ({
  initialMembers,
  fields,
  divisions,
  youtubers,
  functions,
  canCreate,
  canDelete,
  canReadNotes,
}: MembersPanelProps) => {
  const router = useRouter()
  const { members, isSaving, issues, create, remove, clearIssues } = useMembers(initialMembers)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [isCreating, setCreating] = useState(false)
  const [createYoutuberId, setCreateYoutuberId] = useState<string | undefined>(undefined)
  const [pendingDeletion, setPendingDeletion] = useState<MemberSummary | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const ChevronIcon = ICONS.expand

  const toggleGroup = (key: string) => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)

      return next
    })
  }

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
      if (
        filters.youtuber &&
        !member.youtubers.some((youtuber) => youtuber.id === filters.youtuber)
      ) {
        return false
      }
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

  // One bucket per YouTuber, in their configured order, a member with several YouTubers
  // appears in each, moderators left unassigned trailing behind
  const groups = useMemo(() => {
    const buckets = new Map<string, MemberSummary[]>()

    for (const member of visibleMembers) {
      const keys =
        member.youtubers.length > 0 ? member.youtubers.map((youtuber) => youtuber.id) : ['none']

      for (const key of keys) {
        if (!buckets.has(key)) buckets.set(key, [])
        buckets.get(key)!.push(member)
      }
    }

    // Unfiltered, every configured YouTuber keeps its box even with no moderator yet
    const ordered = (
      isFiltered ? youtubers.filter((option) => buckets.has(option.value)) : youtubers
    ).map((option) => ({
      label: option.label,
      youtuberId: option.value as string | undefined,
      image: option.image,
      members: buckets.get(option.value) ?? [],
    }))

    const unassigned = buckets.get('none')

    return unassigned
      ? [
          ...ordered,
          {
            label: MEMBER_COPY.noYoutuber,
            youtuberId: undefined,
            image: undefined,
            members: unassigned,
          },
        ]
      : ordered
  }, [visibleMembers, youtubers, isFiltered])

  const filterDefinitions: FilterDefinition[] = [
    {
      name: 'role',
      label: MEMBER_FILTER_COPY.role,
      allLabel: MEMBER_FILTER_COPY.allRoles,
      options: toOptions(ROLE_REGISTRY),
      mark: 'dot',
    },
    {
      name: 'status',
      label: MEMBER_FILTER_COPY.status,
      allLabel: MEMBER_FILTER_COPY.allStatuses,
      options: toOptions(MEMBER_STATUS_REGISTRY),
      mark: 'dot',
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
      mark: 'avatar',
    },
    {
      name: 'jobFunction',
      label: MEMBER_FILTER_COPY.jobFunction,
      allLabel: MEMBER_FILTER_COPY.allFunctions,
      options: functions,
      mark: 'dot',
    },
  ]

  const openCreate = (youtuberId?: string) => {
    clearIssues()
    setCreateYoutuberId(youtuberId)
    setCreating(true)
  }

  const resetFilters = () => {
    setSearch('')
    setFilters({})
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
          onReset={resetFilters}
          isFiltered={isFiltered}
        />

        {isFiltered && visibleMembers.length === 0 ? (
          <EmptyState
            variant="filter"
            title={MEMBER_COPY.filterTitle}
            description={MEMBER_COPY.filterDescription}
            action={<Button onClick={resetFilters}>{ACTION_COPY.clearFilter}</Button>}
          />
        ) : groups.length === 0 ? (
          <EmptyState
            figure="members"
            title={MEMBER_COPY.emptyTitle}
            description={MEMBER_COPY.emptyDescription}
            action={
              <Button
                variant="primary"
                icon="add"
                onClick={() => openCreate()}
                disabled={!canCreate}
              >
                {MEMBER_COPY.add}
              </Button>
            }
          />
        ) : (
          <div className={GROUP_STYLES.stack}>
            {groups.map((group, index) => {
              const key = group.youtuberId ?? 'none'
              const isOpen = !collapsed.has(key)

              return (
                <div
                  key={key}
                  className={cn(GROUP_STYLES.section, index > 0 && GROUP_STYLES.sectionDivided)}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleGroup(key)}
                    className={GROUP_STYLES.heading}
                  >
                    {group.youtuberId && <Avatar name={group.label} src={group.image} size="sm" />}
                    {group.label}
                    <span className={GROUP_STYLES.count}>{group.members.length}</span>
                    <ChevronIcon
                      className={cn(GROUP_STYLES.chevron, isOpen && GROUP_STYLES.chevronOpen)}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className={LIST_STYLES.grid}>
                      {group.members.map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          showNotesBubble={canReadNotes}
                          canDelete={canDelete && !member.isRoot}
                          onOpen={() => router.push(ROUTES.member(member.id))}
                          onDelete={() => setPendingDeletion(member)}
                        />
                      ))}
                      {canCreate && (
                        <AddRow
                          label={MEMBER_COPY.add}
                          onClick={() => openCreate(group.youtuberId)}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <FormDialog
        open={isCreating}
        title={MEMBER_COPY.add}
        fields={fields}
        initialValues={createYoutuberId ? { youtuberIds: [createYoutuberId] } : undefined}
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
