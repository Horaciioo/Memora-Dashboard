'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { AddRow } from '@/components/structures/inline/AddRow'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FilterBar, type FilterDefinition } from '@/components/structures/data/FilterBar'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { Section } from '@/components/structures/page/Section'
import { useMembers } from '@/core/hooks/data/people/useMembers'
import { foldText } from '@/utils/format/strings'
import { toOptions } from '@/core/lib/forms/options'
import { arrangeMembers, isListedRole } from '@/core/lib/members/arrange'
import { ROLE_REGISTRY, MEMBER_STATUS_REGISTRY } from '@/declarations/access/roles'
import { MEMBER_COPY, MEMBER_FILTER_COPY } from '@/declarations/members/copy'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { CREATOR_GROUP } from '@/declarations/ui/blocks'
import { GROUP_STYLES, LIST_STYLES } from '@/declarations/ui/variants'
import { AcceptedCandidates } from '@/composites/members/AcceptedCandidates'
import { CreatorGroupBanner } from '@/composites/members/CreatorGroupBanner'
import { MemberCard } from '@/composites/members/MemberCard'
import { RoleGlyph } from '@/composites/members/MemberBadges'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { AcceptedCandidate, MemberSummary } from '@/types/members'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { cn } from '@/utils/classnames'

export interface MembersPanelProps {
  initialMembers: MemberSummary[]
  // Accepted, not admitted yet
  accepted: AcceptedCandidate[]
  fields: FieldDefinition[]
  divisions: FieldOption[]
  youtubers: FieldOption[]
  functions: FieldOption[]
  // Creator the page is narrowed to
  creatorId: string | null
  canCreate: boolean
  canDelete: boolean
  canReadNotes: boolean
}

/**
 * Members of one role in the order the list reads them
 * @param {MemberSummary[]} list - Members sharing a role
 * @return {MemberSummary[]} - Ordered members
 */

const inReadingOrder = (list: MemberSummary[]): MemberSummary[] => {
  const { administration, moderators } = arrangeMembers(list)

  return [...administration, ...moderators]
}

// Roles the list shows
const listedRoles = toOptions(ROLE_REGISTRY).filter((option) =>
  isListedRole(option.value as MemberRoleName)
)

// One box of the list
interface MemberGroup {
  key: string
  label: string
  youtuberId: string | undefined
  image?: string | null
  banner?: string | null
  role?: MemberRoleName
  members: MemberSummary[]
}

/**
 * Moderator boxes
 * @param {MemberSummary[]} initialMembers - Rows resolved server-side
 * @param {AcceptedCandidate[]} accepted - Candidates accepted
 * @param {FieldDefinition[]} fields - Field declarations of the moderator form
 * @param {FieldOption[]} divisions - Division filter options
 * @param {FieldOption[]} youtubers - YouTuber filter options and group order
 * @param {FieldOption[]} functions - Function filter options
 * @param {string | null} creatorId - Creator the page is narrowed to
 * @param {boolean} canCreate - Member may add a moderator
 * @param {boolean} canDelete - Member may drop a moderator
 * @param {boolean} canReadNotes - Member may see the notes indicator
 * @return {JSX.Element}
 */

export const MembersPanel = ({
  initialMembers,
  accepted,
  fields,
  divisions,
  youtubers,
  functions,
  creatorId,
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
  // Groups flipped from their default, role groups open and creators folded
  const [flipped, setFlipped] = useState<Set<string>>(new Set())
  const ChevronIcon = ICONS.expand

  const toggleGroup = (key: string) => {
    setFlipped((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)

      return next
    })
  }

  const isFiltered =
    search.trim().length > 0 || Object.values(filters).some((value) => value.length > 0)

  const visibleMembers = useMemo(() => {
    const term = foldText(search.trim())

    return members.filter((member) => {
      // The employees hold every access without sitting in the list
      if (!isListedRole(member.role)) return false

      // Free text runs on the name and on the Discord identifier
      if (
        term.length > 0 &&
        !foldText(member.displayName).includes(term) &&
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
        !member.functions.some((entry) => entry.id === filters.jobFunction)
      ) {
        return false
      }

      return true
    })
  }, [members, search, filters])

  // One bucket per YouTuber
  const groups = useMemo((): MemberGroup[] => {
    // Narrowed to one creator
    if (creatorId) {
      return listedRoles
        .map((option) => ({
          key: option.value,
          label: option.label,
          role: option.value as MemberRoleName,
          youtuberId: creatorId,
          members: inReadingOrder(visibleMembers.filter((member) => member.role === option.value)),
        }))
        .filter((group) => group.members.length > 0)
    }

    const buckets = new Map<string, MemberSummary[]>()

    for (const member of visibleMembers) {
      const keys =
        member.youtubers.length > 0 ? member.youtubers.map((youtuber) => youtuber.id) : ['none']

      for (const key of keys) {
        if (!buckets.has(key)) buckets.set(key, [])
        buckets.get(key)!.push(member)
      }
    }

    // Unfiltered
    const ordered = (
      isFiltered ? youtubers.filter((option) => buckets.has(option.value)) : youtubers
    ).map((option) => ({
      key: option.value,
      label: option.label,
      youtuberId: option.value as string | undefined,
      image: option.image,
      banner: option.banner,
      members: buckets.get(option.value) ?? [],
    }))

    const unassigned = buckets.get('none')

    return unassigned
      ? [
          ...ordered,
          {
            key: 'none',
            label: MEMBER_COPY.noYoutuber,
            youtuberId: undefined,
            image: undefined,
            members: unassigned,
          },
        ]
      : ordered
  }, [visibleMembers, youtubers, isFiltered, creatorId])

  const filterDefinitions: FilterDefinition[] = [
    {
      name: 'role',
      label: MEMBER_FILTER_COPY.role,
      allLabel: MEMBER_FILTER_COPY.allRoles,
      options: listedRoles,
      mark: 'glyph',
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
      mark: 'division',
    },
    // Pointless once the page shows a single creator
    ...(creatorId
      ? []
      : [
          {
            name: 'youtuber',
            label: MEMBER_FILTER_COPY.youtuber,
            allLabel: MEMBER_FILTER_COPY.allYoutubers,
            options: youtubers,
            mark: 'avatar' as const,
          },
        ]),
    {
      name: 'jobFunction',
      label: MEMBER_FILTER_COPY.jobFunction,
      allLabel: MEMBER_FILTER_COPY.allFunctions,
      options: functions,
      mark: 'glyph',
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
              const key = group.key
              const isOpen = flipped.has(key) !== Boolean(group.role)

              const renderCards = (list: MemberSummary[], withAdd: boolean) => (
                <div className={LIST_STYLES.grid}>
                  {list.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      showNotesBubble={canReadNotes}
                      canDelete={canDelete && !member.isRoot}
                      onOpen={() => router.push(ROUTES.member(member.id))}
                      onDelete={() => setPendingDeletion(member)}
                    />
                  ))}
                  {withAdd && canCreate && (
                    <AddRow label={MEMBER_COPY.add} onClick={() => openCreate(group.youtuberId)} />
                  )}
                </div>
              )

              // A creator box splits into the Administration and the moderators
              const { administration, moderators } = arrangeMembers(group.members)
              const sections = [
                { key: 'administration', label: MEMBER_COPY.administration, list: administration },
                { key: 'moderators', label: MEMBER_COPY.moderators, list: moderators },
              ].filter((section) => section.list.length > 0)

              const cards = group.role ? (
                renderCards(group.members, true)
              ) : (
                <div className={CREATOR_GROUP.sections}>
                  {sections.map((section) => (
                    <div key={section.key} className={CREATOR_GROUP.section}>
                      <h3 className={CREATOR_GROUP.sectionHeading}>{section.label}</h3>
                      {renderCards(section.list, section.key === 'moderators')}
                    </div>
                  ))}
                  {moderators.length === 0 && renderCards([], true)}
                  <AcceptedCandidates
                    candidates={accepted.filter((entry) => entry.youtuberId === group.youtuberId)}
                  />
                </div>
              )

              // A creator is its banner, the moderators sit in a box beneath
              if (!group.role) {
                return (
                  <div key={key} className={cn(CREATOR_GROUP.root, index > 0 && 'mt-6')}>
                    <CreatorGroupBanner
                      name={group.label}
                      avatarUrl={group.image}
                      bannerUrl={group.banner}
                      isOpen={isOpen}
                      onToggle={() => toggleGroup(key)}
                    />
                    <div
                      className={isOpen ? CREATOR_GROUP.foldOpen : CREATOR_GROUP.fold}
                      aria-hidden={!isOpen}
                      inert={!isOpen}
                    >
                      <div className={CREATOR_GROUP.foldClip}>
                        <div className={isOpen ? CREATOR_GROUP.boxOpen : CREATOR_GROUP.box}>
                          {cards}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

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
                    <RoleGlyph role={group.role} />
                    {group.label}
                    <ChevronIcon
                      className={cn(GROUP_STYLES.chevron, isOpen && GROUP_STYLES.chevronOpen)}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && cards}
                </div>
              )
            })}
            {creatorId && (
              <AcceptedCandidates
                candidates={accepted.filter((entry) => entry.youtuberId === creatorId)}
              />
            )}
          </div>
        )}
      </Section>

      <FormDrawer
        subject={FORM_SUBJECTS.member}
        open={isCreating}
        title={MEMBER_COPY.add}
        fields={fields}
        initialValues={createYoutuberId ? { youtuberIds: [createYoutuberId] } : undefined}
        issues={issues}
        isSaving={isSaving}
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
