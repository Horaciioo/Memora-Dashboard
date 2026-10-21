'use client'

import { useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { AddRow } from '@/components/structures/inline/AddRow'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/structures/data/DataTable'
import { FilterBar, type FilterDefinition } from '@/components/structures/data/FilterBar'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { WORK_SUBJECTS } from '@/declarations/ui/subjects'
import {
  KanbanBoard,
  type BoardColumn,
  type BoardItem,
} from '@/components/structures/data/KanbanBoard'
import { BoardSelection } from '@/composites/work/BoardSelection'
import { PageOptions, type PageOption } from '@/components/structures/page/PageOptions'
import { Section } from '@/components/structures/page/Section'
import { useBoard, type BoardEndpoints, type BoardEntity } from '@/core/hooks/data/work/useBoard'
import { filledValues } from '@/core/lib/forms'
import { useBoardSelection } from '@/core/hooks/interaction/state/useBoardSelection'
import { BOARD_FILTER_COPY, SELECTION_COPY } from '@/declarations/work/copy'
import { ACTION_COPY, PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import type { IllustrationName } from '@/declarations/ui/illustrations'
import type { MenuItem } from '@/managers/front-end'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { FormSubject } from '@/declarations/ui/copy/forms'
import { WorkflowPhases } from '@/utils/constants/workflow'
import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * Copy of one board surface
 * @typedef {Object} BoardCopy
 * @property {string} title - Section title
 * @property {string} lead - Section description
 * @property {string} add - Label of the creation gesture
 * @property {string} emptyTitle - Empty state headline
 * @property {string} [emptyDescription] - Empty state supporting line
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
  emptyDescription?: string
  filterTitle: string
  filterDescription: string
  deleteTitle: string
  deleteDescription: string
  missingStates: string
}

export interface WorkBoardProps<T extends BoardItem> {
  // Null for a board living outside the workflows, entity and subject then stand in
  scope: WorkflowScopeName | null
  entity?: BoardEntity
  subject?: FormSubject
  // Live result drawn beside the form fields
  aside?: { label: string; render: (values: FormValues) => ReactNode }
  endpoints: BoardEndpoints
  initialCards: T[]
  columns: BoardColumn[]
  fields: FieldDefinition[]
  columnField: string
  copy: BoardCopy
  figure: IllustrationName
  renderCard: (card: T) => ReactNode
  tableColumns: DataTableColumn<T>[]
  filters: FilterDefinition[]
  matches: (card: T, search: string, filters: Record<string, string>) => boolean
  valuesOf: (card: T) => FormValues
  labelOf: (card: T) => string
  onOpen?: (card: T) => void
  // Cards without a page of their own open their edit form on click
  hasPage?: (card: T) => boolean
  extraMenu?: (card: T) => MenuItem[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  tintByColumn?: boolean
  // Page options drawn after the view and the finished switch
  extraOptions?: PageOption[]
  // Columns folded away on top of the finished ones
  hiddenColumns?: string[]
  // Cards the member may edit, move and drop, all by default
  isEditable?: (card: T) => boolean
  isRemovable?: (card: T) => boolean
  // Extra line on the confirmation of a card that takes other things down with it
  deleteNote?: (card: T) => string | null
  // Filters set when the board opens
  initialFilters?: Record<string, string>
}

// Time a done column takes to fold away, matches the board-column animations
const DONE_COLUMN_MS = 520

// Two ways of reading the same cards
const VIEWS = [
  { value: 'board', label: BOARD_FILTER_COPY.board },
  { value: 'list', label: BOARD_FILTER_COPY.list },
] as const

/**
 * Board surface shared by projects
 * @param {WorkflowScopeName | null} scope - Board scope, null outside the workflows
 * @param {BoardEntity} [entity] - Toast label when there is no scope
 * @param {FormSubject} [subject] - Drawer subject when there is no scope
 * @param {{ label: string, render: (values: FormValues) => ReactNode }} [aside] - Live result beside the fields
 * @param {BoardEndpoints} endpoints - Paths of the resource
 * @param {T[]} initialCards - Cards resolved server-side
 * @param {BoardColumn[]} columns - Columns in display order
 * @param {FieldDefinition[]} fields - Field declarations of the form
 * @param {string} columnField - Field carrying the column on the form
 * @param {BoardCopy} copy - Copy of the surface
 * @param {IllustrationName} figure - Empty state figure
 * @param {(card: T) => ReactNode} renderCard - Card renderer
 * @param {DataTableColumn<T>[]} tableColumns - Column definitions of the list view
 * @param {FilterDefinition[]} filters - Declared dropdowns
 * @param {(card: T, search: string, filters: Record<string, string>) => boolean} matches - Filter predicate
 * @param {(card: T) => FormValues} valuesOf - Values feeding the edit form
 * @param {(card: T) => string} labelOf - Display label of a card
 * @param {(card: T) => void} [onOpen] - Called on click and on Enter
 * @param {(card: T) => boolean} [hasPage] - Card leads to a page, edit form otherwise
 * @param {(card: T) => MenuItem[]} [extraMenu] - Extra right click entries
 * @param {boolean} canCreate - Member may add a card
 * @param {boolean} canUpdate - Member may edit a card
 * @param {boolean} canDelete - Member may drop a card
 * @param {boolean} [tintByColumn] - Washes the board in the column accents
 * @param {PageOption[]} [extraOptions] - Page options added to the view and finished ones
 * @param {string[]} [hiddenColumns] - Columns folded away
 * @param {(card: T) => boolean} [isEditable] - Cards the member may edit, move and drop
 * @param {(card: T) => boolean} [isRemovable] - Cards that may be dropped
 * @param {(card: T) => string | null} [deleteNote] - Warning added to the confirmation of a card
 * @param {Record<string, string>} [initialFilters] - Filters set when the board opens
 * @return {JSX.Element}
 */

export const WorkBoard = <T extends BoardItem>({
  scope,
  entity,
  subject,
  aside,
  endpoints,
  initialCards,
  columns,
  fields,
  columnField,
  copy,
  figure,
  renderCard,
  tableColumns,
  filters,
  matches,
  valuesOf,
  labelOf,
  onOpen,
  hasPage,
  extraMenu,
  canCreate,
  canUpdate,
  canDelete,
  tintByColumn,
  extraOptions = [],
  hiddenColumns = [],
  isEditable,
  isRemovable,
  deleteNote,
  initialFilters,
}: WorkBoardProps<T>) => {
  const board = useBoard<T>(scope, endpoints, initialCards, labelOf, entity)
  const [view, setView] = useState<'board' | 'list'>('board')
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>(initialFilters ?? {})
  const [isCreating, setCreating] = useState(false)
  const [createColumn, setCreateColumn] = useState<string | null>(null)
  const [editing, setEditing] = useState<T | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<T | null>(null)

  const isFiltered =
    search.trim().length > 0 || Object.values(filterValues).some((value) => value.length > 0)

  // Finished work stays out until the page options ask for it
  const [showDone, setShowDone] = useState(false)
  // Done columns stay drawn while they fold away
  const [doneMounted, setDoneMounted] = useState(false)
  const foldTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleDone = (next: boolean) => {
    setShowDone(next)
    if (foldTimer.current) clearTimeout(foldTimer.current)

    if (next) setDoneMounted(true)
    else foldTimer.current = setTimeout(() => setDoneMounted(false), DONE_COLUMN_MS)
  }

  const doneColumnIds = useMemo(
    () =>
      new Set(columns.filter((column) => column.phase === WorkflowPhases.Done).map(({ id }) => id)),
    [columns]
  )

  // Done columns fold away
  const visibleColumns = useMemo(
    () =>
      columns
        .filter(
          (column) =>
            !hiddenColumns.includes(column.id) && (doneMounted || !doneColumnIds.has(column.id))
        )
        // A revealed column grows in and a folded one shrinks away rather than popping
        .map((column) =>
          doneColumnIds.has(column.id)
            ? { ...column, entering: showDone, leaving: !showDone }
            : column
        ),
    [columns, doneColumnIds, showDone, doneMounted, hiddenColumns]
  )

  const visibleCards = useMemo(
    () =>
      board.cards.filter((card) => {
        if (!doneMounted && doneColumnIds.has(card.columnId ?? '')) return false
        if (hiddenColumns.includes(card.columnId ?? '')) return false

        return matches(card, search.trim().toLowerCase(), filterValues)
      }),
    [board.cards, doneColumnIds, doneMounted, hiddenColumns, search, filterValues, matches]
  )

  const selection = useBoardSelection(visibleCards)
  const canPick = (card: T) => (canUpdate || canDelete) && (isEditable?.(card) ?? true)
  const selected = visibleCards.filter((card) => selection.ids.includes(card.id))

  // Untouched fields leave the selection alone
  const editSelection = async (values: FormValues) => {
    const filled = filledValues(values)
    if (Object.keys(filled).length === 0) return true

    const done = await board.updateMany(
      selected.map((card) => ({ id: card.id, values: { ...valuesOf(card), ...filled } }))
    )
    if (done) selection.clear()

    return done
  }

  // The system keeps some cards, they are skipped
  const removable = selected.filter((card) => isRemovable?.(card) ?? true)

  const deleteSelection = async () => {
    await board.removeMany(removable.map((card) => card.id))
    selection.clear()
  }

  // A card resting in a done column is finished work
  const hasContent = useMemo(
    () =>
      board.cards.some(
        (card) =>
          !hiddenColumns.includes(card.columnId ?? '') &&
          (doneMounted || !doneColumnIds.has(card.columnId ?? ''))
      ),
    [board.cards, doneColumnIds, doneMounted, hiddenColumns]
  )

  const pageOptions: PageOption[] = [
    {
      id: 'view',
      label: PAGE_OPTIONS_COPY.view,
      value: view,
      choices: [...VIEWS],
      onChange: (value: string) => {
        selection.clear()
        setView(value === 'list' ? 'list' : 'board')
      },
    },
    ...(doneColumnIds.size === 0
      ? []
      : [
          {
            id: 'done',
            label: PAGE_OPTIONS_COPY.showFinished,
            checked: showDone,
            onChange: toggleDone,
          },
        ]),
    ...extraOptions,
  ]

  const openCreate = (columnId?: string) => {
    board.clearIssues()
    setCreateColumn(columnId ?? null)
    setCreating(true)
  }

  const resetFilters = () => {
    setSearch('')
    setFilterValues({})
  }

  const canEdit = (card: T): boolean => canUpdate && (isEditable?.(card) ?? true)

  // A card without a page opens its form, so a click always leads somewhere
  const openCard = (card: T) => {
    if (onOpen && (hasPage?.(card) ?? true)) return onOpen(card)
    if (!canEdit(card)) return
    board.clearIssues()
    setEditing(card)
  }

  const cardMenu = (card: T): MenuItem[] => [
    ...(onOpen && (hasPage?.(card) ?? true)
      ? [
          {
            id: 'open',
            label: ACTION_COPY.open,
            icon: 'forward' as const,
            onSelect: () => onOpen(card),
          },
        ]
      : []),
    ...(canUpdate && (isEditable?.(card) ?? true)
      ? [
          {
            id: 'edit',
            label: ACTION_COPY.edit,
            icon: 'edit' as const,
            onSelect: () => {
              board.clearIssues()
              setEditing(card)
            },
          },
        ]
      : []),
    ...(view === 'board' && canPick(card)
      ? [
          {
            id: 'select',
            label: selection.ids.includes(card.id)
              ? SELECTION_COPY.deselect
              : SELECTION_COPY.select,
            icon: 'check' as const,
            onSelect: () => selection.toggle(card.id),
          },
        ]
      : []),
    ...(extraMenu?.(card) ?? []),
    ...(canDelete && (isEditable?.(card) ?? true) && (isRemovable?.(card) ?? true)
      ? [
          {
            id: 'delete',
            label: ACTION_COPY.delete,
            icon: 'remove' as const,
            danger: true,
            separatorBefore: true,
            onSelect: () => setPendingDeletion(card),
          },
        ]
      : []),
  ]

  // The drawn figure and the dashed creation rows are alternatives
  const showEmptyState =
    columns.length === 0 || (isFiltered ? visibleCards.length === 0 : !hasContent)

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
        action: canCreate ? (
          <Button
            variant="primary"
            icon="add"
            disabled={columns.length === 0}
            onClick={() => openCreate()}
          >
            {copy.add}
          </Button>
        ) : undefined,
      }

  return (
    <>
      <PageOptions options={pageOptions} />
      <Section bare>
        <FilterBar
          searchLabel={BOARD_FILTER_COPY.search}
          search={search}
          onSearch={setSearch}
          filters={filters}
          values={filterValues}
          onFilter={(name, value) => setFilterValues((current) => ({ ...current, [name]: value }))}
          onReset={resetFilters}
          isFiltered={isFiltered}
        />
        {view === 'board' && selected.length > 0 && (
          <BoardSelection
            count={selected.length}
            fields={fields}
            canUpdate={canUpdate}
            canDelete={canDelete && removable.length > 0}
            isSaving={board.isSaving}
            issues={board.issues}
            clearIssues={board.clearIssues}
            onClear={selection.clear}
            onEdit={editSelection}
            onDelete={deleteSelection}
          />
        )}
        {showEmptyState ? (
          <EmptyState {...emptyState} />
        ) : view === 'board' ? (
          <KanbanBoard
            columns={visibleColumns}
            items={visibleCards}
            renderCard={renderCard}
            onMove={board.move}
            onOpen={onOpen ? openCard : undefined}
            cardMenu={cardMenu}
            addLabel={copy.add}
            canCreate={canCreate}
            onCreate={openCreate}
            canMove={canUpdate}
            canMoveItem={isEditable}
            tintByColumn={tintByColumn}
            selection={selection.ids}
            canSelectItem={canPick}
            onToggle={(card) => selection.toggle(card.id)}
            onSelectMany={selection.pick}
          />
        ) : (
          <DataTable
            columns={tableColumns}
            rows={visibleCards}
            getRowId={(card) => card.id}
            onRowOpen={onOpen ? openCard : undefined}
            rowMenu={cardMenu}
          />
        )}
        {view === 'list' && visibleCards.length > 0 && canCreate && (
          <AddRow label={copy.add} onClick={() => openCreate()} />
        )}
      </Section>

      <FormDrawer
        subject={subject ?? WORK_SUBJECTS[scope!]}
        open={isCreating}
        title={copy.add}
        fields={fields}
        aside={aside}
        initialValues={createColumn ? { [columnField]: createColumn } : undefined}
        issues={board.issues}
        isSaving={board.isSaving}
        onSubmit={board.create}
        onClose={() => setCreating(false)}
      />

      <FormDrawer
        subject={subject ?? WORK_SUBJECTS[scope!]}
        open={editing !== null}
        title={editing ? `${ACTION_COPY.edit} ${labelOf(editing)}` : ACTION_COPY.edit}
        fields={fields}
        aside={aside}
        initialValues={editing ? valuesOf(editing) : undefined}
        recordId={editing?.id}
        issues={board.issues}
        isSaving={board.isSaving}
        onSubmit={(values) => board.update(editing!.id, values)}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={copy.deleteTitle}
        description={[
          copy.deleteDescription,
          pendingDeletion ? deleteNote?.(pendingDeletion) : null,
        ]
          .filter(Boolean)
          .join(' ')}
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
