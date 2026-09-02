import { Badge } from '@/components/elements/display/Badge'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { MEDIA_VISIBILITIES, STORAGE_BUCKETS } from '@/declarations/system/storage'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { formatBytes, formatNumber } from '@/utils/format/numbers'
import type { StorageReport } from '@/core/services/system/ConsoleService'

export interface StoragePanelProps {
  report: StorageReport
}

/**
 * One row per destination, the declared ones first and anything still held under a
 * retired key after them, so nothing kept in the store stays invisible
 * @param {StorageReport} report - Storage usage resolved server-side
 * @return {JSX.Element}
 */

export const StoragePanel = ({ report }: StoragePanelProps) => {
  const usage = new Map(report.buckets.map((entry) => [entry.bucket, entry]))
  const Icon = ICONS.storage

  const rows = [
    ...STORAGE_BUCKETS.keys.map((bucket) => ({
      key: bucket as string,
      meta: STORAGE_BUCKETS.get(bucket),
    })),
    ...report.buckets
      .filter((entry) => !STORAGE_BUCKETS.has(entry.bucket))
      .map((entry) => ({ key: entry.bucket, meta: null })),
  ]

  return (
    <div className={CONSOLE_BLOCK.rows}>
      {rows.map(({ key, meta }) => {
        const held = usage.get(key)
        const isPublic = meta?.visibility === MEDIA_VISIBILITIES.Public

        return (
          <div key={key} className={CONSOLE_BLOCK.row}>
            <span className={CONSOLE_BLOCK.rowLabel}>
              <Icon className={CONSOLE_BLOCK.rowIcon} aria-hidden="true" />
              {meta?.label ?? key}
            </span>

            <span className={CONSOLE_BLOCK.rowStatus}>
              <span className={CONSOLE_BLOCK.rowMeta}>
                {`${formatNumber(held?.entries ?? 0)} · ${formatBytes(held?.bytes ?? 0)}`}
              </span>
              {meta ? (
                <>
                  <span className={CONSOLE_BLOCK.rowMeta}>
                    {`${SYSTEM_COPY.storageCeiling} ${formatBytes(meta.maxBytes)}`}
                  </span>
                  <Badge
                    label={isPublic ? SYSTEM_COPY.storagePublic : SYSTEM_COPY.storagePrivate}
                    tone={isPublic ? 'info' : 'neutral'}
                    icon={isPublic ? 'visible' : 'lock'}
                  />
                </>
              ) : (
                <Badge label={SYSTEM_COPY.storageUndeclared} tone="warning" />
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}
