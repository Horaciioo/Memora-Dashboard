import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import type { DataTableColumn } from '@/components/structures/data/DataTable'
import { PAGE_LEVELS } from '@/declarations/pages/access'
import { PAGE_REGISTRY_COPY, PAGES_COPY } from '@/declarations/pages/copy'
import { PAGE_REGISTRY_STYLES } from '@/declarations/ui/variants'
import type { PageRegistryRow } from '@/types/pages'
import { formatDay } from '@/utils/format/dates'

/**
 * Columns of the page registry, titles and access only
 * @type {DataTableColumn<PageRegistryRow>[]}
 */

export const REGISTRY_COLUMNS: DataTableColumn<PageRegistryRow>[] = [
  {
    key: 'page',
    header: PAGE_REGISTRY_COPY.columnPage,
    sortValue: (row) => row.title.toLowerCase(),
    render: (row) => (
      <span className={PAGE_REGISTRY_STYLES.page}>
        <span className={PAGE_REGISTRY_STYLES.title}>
          {row.icon ? `${row.icon} ` : ''}
          {row.title || PAGES_COPY.untitled}
        </span>
        {row.parentTitle !== null && (
          <span className={PAGE_REGISTRY_STYLES.hint}>{`${PAGES_COPY.subpagesTitle} · ${row.parentTitle || PAGES_COPY.untitled}`}</span>
        )}
      </span>
    ),
  },
  {
    key: 'owner',
    header: PAGE_REGISTRY_COPY.columnOwner,
    sortValue: (row) => row.ownerName.toLowerCase(),
    render: (row) => (
      <span className={PAGE_REGISTRY_STYLES.owner}>
        <Avatar name={row.ownerName} src={row.ownerImage} size="xs" />
        {row.ownerName}
      </span>
    ),
  },
  {
    key: 'access',
    header: PAGE_REGISTRY_COPY.columnAccess,
    render: (row) => (
      <span className={PAGE_REGISTRY_STYLES.access}>
        {row.shares.length === 0 && <span className={PAGE_REGISTRY_STYLES.hint}>{PAGE_REGISTRY_COPY.onlyOwner}</span>}
        {row.shares.map((share) => (
          <span key={share.label}>{`${share.label} · ${PAGE_LEVELS.get(share.level).label}`}</span>
        ))}
        {row.parentTitle !== null && row.inheritAccess && (
          <span className={PAGE_REGISTRY_STYLES.hint}>{PAGE_REGISTRY_COPY.inherited.replace('{parent}', row.parentTitle || PAGES_COPY.untitled)}</span>
        )}
      </span>
    ),
  },
  {
    key: 'created',
    header: PAGE_REGISTRY_COPY.columnCreated,
    sortValue: (row) => row.createdAt,
    render: (row) => formatDay(row.createdAt),
  },
  {
    key: 'edited',
    header: PAGE_REGISTRY_COPY.columnEdited,
    sortValue: (row) => row.contentAt,
    render: (row) => formatDay(row.contentAt),
  },
  {
    key: 'state',
    header: PAGE_REGISTRY_COPY.columnState,
    render: (row) =>
      row.trashedAt ? (
        <Status label={PAGE_REGISTRY_COPY.trashed} tone="danger" />
      ) : (
        <Status label={PAGE_REGISTRY_COPY.active} tone="success" />
      ),
  },
]
