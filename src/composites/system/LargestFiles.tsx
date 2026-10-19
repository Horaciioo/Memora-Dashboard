import { STORAGE_BUCKETS } from '@/declarations/system/storage'
import { Dotted } from '@/components/elements/display/Dotted'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import type { LargeFile } from '@/core/services/system/ConsoleService'
import { formatDayTime } from '@/utils/format/dates'
import { formatBytes } from '@/utils/format/numbers'

export interface LargestFilesProps {
  files: LargeFile[]
}

/**
 * Heaviest stored files
 * @param {LargeFile[]} files - Files, heaviest first
 * @return {JSX.Element}
 */

export const LargestFiles = ({ files }: LargestFilesProps) => (
  <div className={CONSOLE_BLOCK.rows}>
    {files.map((file) => (
      <div key={file.id} className={CONSOLE_BLOCK.row}>
        <span className="flex min-w-0 flex-col">
          <span className={CONSOLE_BLOCK.rowLabel}>
            {STORAGE_BUCKETS.has(file.bucket)
              ? STORAGE_BUCKETS.get(file.bucket).label
              : file.bucket}
          </span>
          <span className={CONSOLE_BLOCK.rowMeta}>
            <Dotted items={[file.mimeType, formatDayTime(file.createdAt)]} />
          </span>
        </span>
        <span className={CONSOLE_BLOCK.rowMeta}>{formatBytes(file.bytes)}</span>
      </div>
    ))}
  </div>
)
