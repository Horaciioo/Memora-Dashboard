'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { Status } from '@/components/elements/display/Status'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FilterBar, type FilterDefinition } from '@/components/structures/data/FilterBar'
import { AddRow } from '@/components/structures/inline/AddRow'
import { accentVars } from '@/declarations/ui/theme'
import { PASTEL_TAG } from '@/declarations/ui/variants'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { RowList, type RowListGroup, type RowListItem } from '@/components/structures/data/RowList'
import { Section } from '@/components/structures/page/Section'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useCandidateView } from '@/core/hooks/interaction/state/useCandidateView'
import {
  CANDIDATE_SORTS,
  type CandidateSort,
  DEFAULT_CANDIDATE_SORT,
  filterCandidates,
  isCandidateSort,
  sortCandidates,
} from '@/core/lib/recruitment/candidateList'
import {
  CANDIDATE_SORT_COPY,
  CANDIDATE_SORT_ICONS,
  RECRUITMENT_COPY,
  RECRUITMENT_FILTER_COPY,
} from '@/declarations/recruitment/copy'
import { HISTORY_COPY } from '@/declarations/recruitment/historyCopy'
import type { CandidateView } from '@/types/recruitment'
import { formatDayTime } from '@/utils/format/dates'

/**
 * Candidates of the session, filtered and sorted
 * @return {JSX.Element}
 */

export const CandidatesTab = () => {
  const { detail, file, can, candidateForm, candidateMenu, openCandidate } = useRecruitmentState()
  const [search, setSearch] = useState('')
  const [view, setView, resetView] = useCandidateView()

  const sort = isCandidateSort(view.sort) ? view.sort : DEFAULT_CANDIDATE_SORT
  const isFiltered = search.trim() !== '' || view.recruiterId !== '' || view.outcomeId !== ''
  const direction = view.order === 'descending' ? -1 : 1

  // Recruiters seated on a candidate
  const recruiters = [
    ...new Map(file.candidates.flatMap((c) => c.recruiters).map((r) => [r.id, r])).values(),
  ].sort((a, b) => direction * a.label.localeCompare(b.label, 'fr'))

  // Identifier sort needs the identifier
  const sortKeys = Object.keys(CANDIDATE_SORTS).filter(
    (key) => key !== DEFAULT_CANDIDATE_SORT && !(can.observing && key === 'discordId')
  )

  const filters: FilterDefinition[] = [
    {
      name: 'recruiterId',
      label: RECRUITMENT_FILTER_COPY.recruiter,
      allLabel: RECRUITMENT_FILTER_COPY.allRecruiters,
      mark: 'avatar',
      options: recruiters.map((r) => ({ value: r.id, label: r.label, image: r.image })),
    },
    {
      name: 'outcomeId',
      label: RECRUITMENT_FILTER_COPY.outcome,
      allLabel: RECRUITMENT_FILTER_COPY.allOutcomes,
      mark: 'dot',
      options: detail.outcomes.map((o) => ({
        value: o.id,
        label: o.label,
        accent: o.accent ?? undefined,
      })),
    },
    {
      name: 'order',
      label: RECRUITMENT_FILTER_COPY.order,
      allLabel: RECRUITMENT_FILTER_COPY.ascending,
      allIcon: 'sortAscending',
      mark: 'glyph',
      options: [
        { value: 'descending', label: RECRUITMENT_FILTER_COPY.descending, icon: 'sortDescending' },
      ],
    },
    {
      name: 'sort',
      label: RECRUITMENT_FILTER_COPY.sort,
      allLabel: CANDIDATE_SORT_COPY[DEFAULT_CANDIDATE_SORT],
      allIcon: CANDIDATE_SORT_ICONS[DEFAULT_CANDIDATE_SORT],
      mark: 'glyph',
      options: sortKeys.map((key) => ({
        value: key,
        label: CANDIDATE_SORT_COPY[key as keyof typeof CANDIDATE_SORT_COPY],
        icon: CANDIDATE_SORT_ICONS[key as CandidateSort],
      })),
    },
  ]

  const resetFilters = () => {
    setSearch('')
    resetView()
  }

  const visible = sortCandidates(
    filterCandidates(file.candidates, {
      search,
      recruiterId: view.recruiterId,
      outcomeId: view.outcomeId,
    }),
    sort
  )

  const rowOf = (candidate: CandidateView): RowListItem => ({
    id: candidate.id,
    title: candidate.name,
    meta: candidate.interviewAt ? formatDayTime(candidate.interviewAt) : undefined,
    metaTag: candidate.interviewAt ? undefined : (
      <span
        className={PASTEL_TAG}
        style={accentVars(detail.outcomes.find((o) => o.id === candidate.outcomeId)?.accent)}
      >
        {RECRUITMENT_COPY.toSchedule}
      </span>
    ),
    lead: <Avatar name={candidate.name} src={candidate.avatarUrl} size="md" />,
    trail: detail.bannedIds.includes(candidate.discordId) ? (
      <Status label={HISTORY_COPY.banned} tone="danger" />
    ) : undefined,
    menu: candidateMenu(candidate),
    onOpen: () => openCandidate(candidate.id),
  })

  // One group per recruiter
  const groups: RowListGroup[] = [
    ...recruiters
      .map((recruiter) => ({
        id: recruiter.id,
        label: recruiter.label,
        lead: <Avatar name={recruiter.label} src={recruiter.image} size="xs" />,
        items: visible
          .filter((candidate) => candidate.recruiters.some((seat) => seat.id === recruiter.id))
          .map(rowOf),
      }))
      .filter((group) => group.items.length > 0),
    {
      id: 'unassigned',
      label: RECRUITMENT_COPY.noRecruiter,
      items: visible.filter((candidate) => candidate.recruiters.length === 0).map(rowOf),
    },
  ].filter((group) => group.items.length > 0)

  return (
    <Section title={RECRUITMENT_COPY.tabCandidates} bare>
      {file.candidates.length === 0 ? (
        <EmptyState
          figure="members"
          title={RECRUITMENT_COPY.candidatesEmptyTitle}
          description={RECRUITMENT_COPY.candidatesEmptyDescription}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!can.manage}
              onClick={() => candidateForm(null)}
            >
              {RECRUITMENT_COPY.candidateAdd}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          <FilterBar
            searchLabel={RECRUITMENT_FILTER_COPY.searchCandidates}
            search={search}
            onSearch={setSearch}
            filters={filters}
            values={{
              recruiterId: view.recruiterId,
              outcomeId: view.outcomeId,
              order: view.order,
              sort: view.sort,
            }}
            onFilter={(name, value) => setView(name as 'sort', value)}
            onReset={resetFilters}
            isFiltered={isFiltered}
          />
          {visible.length === 0 ? (
            <EmptyState
              variant="filter"
              title={RECRUITMENT_FILTER_COPY.filterTitle}
              description={RECRUITMENT_FILTER_COPY.filterDescription}
              action={<Button onClick={resetFilters}>{ACTION_COPY.clearFilter}</Button>}
            />
          ) : (
            <RowList groups={groups} isFoldable />
          )}
          <AddRow
            label={RECRUITMENT_COPY.candidateAdd}
            disabled={!can.manage}
            onClick={() => candidateForm(null)}
          />
        </div>
      )}
    </Section>
  )
}
