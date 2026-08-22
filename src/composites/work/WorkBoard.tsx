'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/structures/DataTable'
import { FilterBar, type FilterDefinition } from '@/components/structures/FilterBar'
import { FormDialog } from '@/components/structures/FormDialog'
import { KanbanBoard, type BoardColumn, type BoardItem } from '@/components/structures/KanbanBoard'
import { Section } from '@/components/structures/Section'
import { useBoard, type BoardEndpoints } from '@/core/hooks/data/useBoard'
import { BOARD_FILTER_COPY } from '@/declarations/work/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { IllustrationName } from '@/declarations/ui/illustrations'
import type { MenuItem } from '@/managers/front-end'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * Copy of one board surface
 * @typedef {Object} BoardCopy
 * @property {string} title - Section title
 * @property {string} lead - Section description
 * @property {string} add - Label of the creation gesture
 * @property {string} emptyTitle - Empty state headline
 * @property {string} emptyDescription - Empty state supporting line
 * @property {string} emptyColumn - Line shown inside an empty column
 * @property {string} filterTitle - Filtered empty headline
 * @property {string} filterDescription - Filtered empty supporting line
 * @property {string} deleteTitle - Confirmation headline
 * @property {string} deleteDescription - Confirmation supporting line
 * @property {string} missingStates - Line shown when no column exists yet
 */

export interface BoardCopy {
  title: string
  lead: string
  add: string
  emptyTitle: string
  emptyDescription: string
  emptyColumn: string
  filterTitle: string
  filterDescription: string
  deleteTitle: string
  deleteDescription: string
  missingStates: string
}

export interface WorkBoardProps<T extends BoardItem> {
  scope: WorkflowScopeName
  endpoints: BoardEndpoints
  initialCards: T[]
  columns: BoardColumn[]
  fields: FieldDefinition[]
  copy: BoardCopy
  figure: IllustrationName
  renderCard: (card: T) => ReactNode
  tableColumns: DataTableColumn<T>[]
  filters: FilterDefinition[]
  matches: (card: T, search: string, filters: Record<string, string>) => boolean
  valuesOf: (card: T) => FormValues
  labelOf: (card: T) => string
  onOpen?: (card: T) => void
  extraMenu?: (card: T) => MenuItem[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

// Two ways of reading the same cards
const VIEWS = [
  { value: 'board', label: BOARD_FILTER_COPY.board },
  { value: 'list', label: BOARD_FILTER_COPY.list },
] as const

/**
 * Board surface shared by projects, tasks and meetings — filters, a draggable board, a
 * sortable list, and the dialogs that create, edit and drop a card
 * @param {WorkflowScopeName} scope - Board scope
 * @param {BoardEndpoints} endpoints - Paths of the resource
 * @param {T[]} initialCards - Cards resolved server-side
 * @param {BoardColumn[]} columns - Columns in display order
 * @param {FieldDefinition[]} fields - Field declarations of the form
 * @param {BoardCopy} copy - Copy of the surface
 * @param {IllustrationName} figure - Empty state figure
 * @param {(card: T) => ReactNode} renderCard - Card renderer
 * @param {DataTableColumn<T>[]} tableColumns - Column definitions of the list view
 * @param {FilterDefinition[]} filters - Declared dropdowns
 * @param {(card: T, search: string, filters: Record<string, string>) => boolean} matches - Filter predicate
 * @param {(card: T) => FormValues} valuesOf - Values feeding the edit form
 * @param {(card: T) => string} labelOf - Display label of a card
 * @param {(card: T) => void} [onOpen] - Called on click and on Enter
 * @param {(card: T) => MenuItem[]} [extraMenu] - Extra right click entries
 * @param {boolean} canCreate - Member may add a card
 * @param {boolean} canUpdate - Member may edit a card
 * @param {boolean} canDelete - Member may drop a card
 * @return {JSX.Element}
 */

export const WorkBoard = <T extends BoardItem>({
  scope,
  endpoints,
  initialCards,
  columns,
  fields,
  copy,
  figure,
  renderCard,
  tableColumns,
  filters,
  matches,
  valuesOf,
  labelOf,
  onOpen,
  extraMenu,
  canCreate,
  canUpdate,
  canDelete,
}: WorkBoardProps<T>) => {
  const board = useBoard<T>(scope, endpoints, initialCards)
  const [view, setView] = useState<'board' | 'list'>('board')
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [isCreating, setCreating] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<T | null>(null)

  const isFiltered =
    search.trim().length > 0 || Object.values(filterValues).some((value) => value.length > 0)

  const visibleCards = useMemo(
    () => board.cards.filter((card) => matches(card, search.trim().toLowerCase(), filterValues)),
    [board.cards, search, filterValues, matches]
  )

  const openCreate = () => {
    board.clearIssues()
    setCreating(true)
  }

  const resetFilters = () => {
    setSearch('')
    setFilterValues({})
  }

  const cardMenu = (card: T): MenuItem[] => [
    ...(onOpen
      ? [{ id: 'open', label: ACTION_COPY.open, icon: 'forward' as const, onSelect: () => onOpen(card) }]
      : []),
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canUpdate,
      onSelect: () => {
        board.clearIssues()
        setEditing(card)
      },
    },
    ...(extraMenu?.(card) ?? []),
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canDelete,
      onSelect: () => setPendingDeletion(card),
    },
  ]

  const emptyState = isFiltered
    ? {
        variant: 'filter' as const,
        title: copy.filterTitle,
        description: copy.filterDescription,
        action: <Button onClick={resetFilters}>{ACTION_COPY.clearFilter}</Button>,
      }
    : {
        variant: 'start' as const,
        figure,
        title: copy.emptyTitle,
        description: columns.length === 0 ? copy.missingStates : copy.emptyDescription,
        action: (
          <Button
            variant="primary"
            icon="add"
            disabled={!canCreate || columns.length === 0}
            onClick={openCreate}
          >
            {copy.add}
          </Button>
        ),
      }

  return (
    <>
      <Section
        title={copy.title}
        description={copy.lead}
        action={
          board.cards.length > 0 && canCreate ? (
            <Button variant="primary" icon="add" onClick={openCreate}>
              {copy.add}
            </Button>
          ) : undefined
        }
        bare
      >
        <FilterBar
          searchLabel={BOARD_FILTER_COPY.search}
          search={search}
          onSearch={setSearch}
          filters={filters}
          values={filterValues}
          onFilter={(name, value) =>
            setFilterValues((current) => ({ ...current, [name]: value }))
          }
          onReset={resetFilters}
          isFiltered={isFiltered}
          action={
            <SegmentedControl
              options={[...VIEWS]}
              value={view}
              onChange={setView}
              label={BOARD_FILTER_COPY.board}
            />
          }
        />
        {visibleCards.length === 0 ? (
          <EmptyState {...emptyState} />
        ) : view === 'board' ? (
          <KanbanBoard
            columns={columns}
            items={visibleCards}
            renderCard={renderCard}
            onMove={board.move}
            onOpen={onOpen}
            cardMenu={cardMenu}
            emptyColumn={copy.emptyColumn}
            canMove={canUpdate}
          />
        ) : (
          <DataTable
            columns={tableColumns}
            rows={visibleCards}
            getRowId={(card) => card.id}
            onRowOpen={onOpen}
            rowMenu={cardMenu}
          />
        )}
      </Section>

      <FormDialog
        open={isCreating}
        title={copy.add}
        fields={fields}
        issues={board.issues}
        isSaving={board.isSaving}
        wide
        onSubmit={board.create}
        onClose={() => setCreating(false)}
      />

      <FormDialog
        open={editing !== null}
        title={editing ? `${ACTION_COPY.edit} · ${labelOf(editing)}` : ACTION_COPY.edit}
        fields={fields}
        initialValues={editing ? valuesOf(editing) : undefined}
        issues={board.issues}
        isSaving={board.isSaving}
        wide
        onSubmit={(values) => board.update(editing!.id, values)}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={copy.deleteTitle}
        description={copy.deleteDescription}
        pending={board.isSaving}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={async () => {
          await board.remove(pendingDeletion!.id)
          setPendingDeletion(null)
        }}
      />
    </>
  )
}
