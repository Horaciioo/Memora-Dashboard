import { Avatar } from '@/components/elements/display/Avatar'
import { StatusText } from '@/components/elements/display/StatusText'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ACADEMY_JUNIOR_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { MEMBER_BLOCK, MEMBER_FILE } from '@/declarations/ui/blocks'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { SESSION_CARD } from '@/declarations/ui/variants'
import type { JuniorView } from '@/types/academy'

export interface JuniorRailProps {
  junior: JuniorView
  functionName: string
  // Mean mastery over the competencies, 0 to 100
  skillAverage: number
  isReady: boolean
  canEdit: boolean
  onEdit: () => void
}

/**
 * Identity rail of a junior's file: who they are, where they stand, how far each track went.
 * The bars carry the progress, the tabs carry the detail
 * @param {JuniorView} junior - Junior followed
 * @param {string} functionName - Function the session is scoped to
 * @param {number} skillAverage - Mean mastery, 0 to 100
 * @param {boolean} isReady - Every mandatory training is cleared
 * @param {boolean} canEdit - Viewer may change the file
 * @param {() => void} onEdit - Opens the junior form
 * @return {JSX.Element}
 */

export const JuniorRail = ({
  junior,
  functionName,
  skillAverage,
  isReady,
  canEdit,
  onEdit,
}: JuniorRailProps) => {
  const status = ACADEMY_JUNIOR_STATUS_REGISTRY.get(junior.status)
  const trainingShare =
    junior.trainings.length > 0 ? (junior.completedCount / junior.trainings.length) * 100 : 0

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
        <StatusText label={status.label} accent={status.accent} />
      </div>

      <div className={MEMBER_FILE.body}>
        <dl className={MEMBER_FILE.railList}>
          <div className={MEMBER_FILE.railItem}>
            <dt className={MEMBER_FILE.groupTitle}>{ACADEMY_COPY.railProgramme}</dt>
            <dd className={junior.dispositif ? MEMBER_FILE.factValue : MEMBER_FILE.factEmpty}>
              {junior.dispositif?.name ?? ACADEMY_COPY.awaitingConfirmation}
            </dd>
          </div>
          <div className={MEMBER_FILE.railItem}>
            <dt className={MEMBER_FILE.groupTitle}>{ACADEMY_COPY.railTrainer}</dt>
            <dd className={junior.trainer ? MEMBER_FILE.factValue : MEMBER_FILE.factEmpty}>
              {junior.trainer?.name ?? ACADEMY_COPY.noTrainer}
            </dd>
          </div>
          <div className={MEMBER_FILE.railItem}>
            <dt className={MEMBER_FILE.groupTitle}>{ACADEMY_COPY.progression}</dt>
            <dd>
              <div className={SESSION_CARD.track} aria-hidden="true">
                <div className={SESSION_CARD.fill} style={{ width: `${trainingShare}%` }} />
              </div>
            </dd>
          </div>
          <div className={MEMBER_FILE.railItem}>
            <dt className={MEMBER_FILE.groupTitle}>{ACADEMY_COPY.tabCompetences}</dt>
            <dd>
              <div className={SESSION_CARD.track} aria-hidden="true">
                <div className={SESSION_CARD.fill} style={{ width: `${skillAverage}%` }} />
              </div>
            </dd>
          </div>
          <div className={MEMBER_FILE.railItem}>
            <dd>
              <StatusText
                label={isReady ? ACADEMY_COPY.ready : ACADEMY_COPY.blocked}
                accent={isReady ? 'success' : 'warning'}
              />
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  )
}
