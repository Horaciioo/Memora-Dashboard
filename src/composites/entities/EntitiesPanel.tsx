'use client'

import { useMemo, useState, type MouseEvent } from 'react'
import { DataTable, type DataTableColumn } from '@/components/structures/DataTable'
import { SectionHeader } from '@/components/structures/SectionHeader'
import { EntityList } from '@/composites/entities/EntityList'
import { MOCK_ENTITIES } from '@/composites/entities/mockEntities'
import { Button } from '@/components/elements/actions/Button'
import { Select } from '@/components/elements/forms/Select'
import type { EmptyStateProps } from '@/components/elements/feedback/EmptyState'
import { useHints } from '@/managers/front-end'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { Entity, EntityStatus } from '@/types/entity'
import { ENTITY_STATUSES } from '@/utils/constants'

export interface EntitiesPanelProps {
  entities: Entity[]
}

const COLUMNS: DataTableColumn<Entity>[] = [
  { key: 'name', header: 'Name', render: (entity) => entity.name },
  { key: 'status', header: 'Status', render: (entity) => ENTITY_STATUSES.label(entity.status) },
  { key: 'updatedAt', header: 'Updated', render: (entity) => entity.updatedAt },
]

// Empty value stands for "no filter", every other option comes from the enumeration
const ALL_STATUSES = ''

/**
 * Demo panel, wires a shared isLoading flag into both skeleton consumption patterns and a
 * shared entities/filter state into both EmptyState paths — no separate "Add entity"
 * button exists, its action is the only way to repopulate the list
 * @param {Entity[]} entities - Entities loaded server-side, reused as the fake refetch result
 * @return {JSX.Element}
 */

export const EntitiesPanel = ({ entities: initialEntities }: EntitiesPanelProps) => {
  const [entities, setEntities] = useState(initialEntities)
  const [statusFilter, setStatusFilter] = useState<EntityStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { notify } = useNotifications()
  const { showHint } = useHints()

  const filteredEntities = useMemo(
    () =>
      statusFilter === null
        ? entities
        : entities.filter((entity) => entity.status === statusFilter),
    [entities, statusFilter]
  )

  const simulateReload = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      notify({ tone: 'success', title: 'Entities refreshed' })
    }, 1400)
  }

  const clearEntities = () => {
    setEntities([])
    notify({ tone: 'info', title: 'All entities cleared' })
  }

  const addEntity = (event: MouseEvent<HTMLButtonElement>) => {
    setEntities(MOCK_ENTITIES)
    setStatusFilter(null)
    showHint('Entity added', { x: event.clientX, y: event.clientY })
  }

  const emptyState: EmptyStateProps =
    entities.length === 0
      ? {
          variant: 'start',
          title: 'No entities yet',
          description: 'Create your first entity to see it listed here.',
          action: (
            <Button variant="primary" onClick={addEntity}>
              Add entity
            </Button>
          ),
        }
      : {
          variant: 'filter',
          action: <Button onClick={() => setStatusFilter(null)}>Clear filter</Button>,
        }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="status-filter" className="text-sm text-[var(--color-ink-subtle)]">
          Status
        </label>
        <Select
          id="status-filter"
          value={statusFilter ?? ALL_STATUSES}
          onChange={(event) =>
            setStatusFilter(
              event.target.value === ALL_STATUSES
                ? null
                : (Number(event.target.value) as EntityStatus)
            )
          }
        >
          <option value={ALL_STATUSES}>All statuses</option>
          {ENTITY_STATUSES.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        {entities.length > 0 && (
          <Button className="ml-auto" onClick={clearEntities}>
            Clear all entities
          </Button>
        )}
      </div>
      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Native pattern — DataTable"
          action={<Button onClick={simulateReload}>Simulate reload</Button>}
        />
        <DataTable
          columns={COLUMNS}
          rows={filteredEntities}
          getRowId={(entity) => entity.id}
          isLoading={isLoading}
          emptyState={emptyState}
        />
      </section>
      <section className="flex flex-col gap-3">
        <SectionHeader title="Manual pattern — EntityList" />
        <EntityList entities={filteredEntities} isLoading={isLoading} emptyState={emptyState} />
      </section>
    </div>
  )
}
