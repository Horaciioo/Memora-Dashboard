import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { ACADEMY_JUNIOR_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { MEMBER_BLOCK, MEMBER_FILE } from '@/declarations/ui/blocks'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { JuniorView } from '@/types/academy'

export interface JuniorRailProps {
  junior: JuniorView
  functionName: string
  canEdit: boolean
  onEdit: () => void
}

/**
 * Identity rail of a junior's file: who they are and nothing else, the tabs carry the detail
 * @param {JuniorView} junior - Junior followed
 * @param {string} functionName - Function the session is scoped to
 * @param {boolean} canEdit - Viewer may change the file
 * @param {() => void} onEdit - Opens the junior form
 * @return {JSX.Element}
 */

export const JuniorRail = ({ junior, functionName, canEdit, onEdit }: JuniorRailProps) => {
  const status = ACADEMY_JUNIOR_STATUS_REGISTRY.get(junior.status)

  return (
    <aside className={MEMBER_FILE.rail}>
      <div className={MEMBER_FILE.head}>
        <button
          type="button"
          disabled={!canEdit}
          aria-label={ACTION_COPY.edit}
          title={ACTION_COPY.edit}
          onClick={onEdit}
          className={MEMBER_BLOCK.portrait}
        >
          <Avatar name={junior.displayName} src={junior.avatarUrl} size="xl" />
        </button>
        <span className={MEMBER_FILE.name}>{junior.displayName}</span>
        <span className={MEMBER_FILE.role}>{functionName}</span>
        <Status label={status.label} accent={status.accent} />
      </div>
    </aside>
  )
}
