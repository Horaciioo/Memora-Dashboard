'use client'

import Link from '@/components/elements/navigation/AppLink'

import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { ActivityPanel } from '@/components/structures/data/ActivityPanel'
import { FileHead } from '@/components/structures/page/FileHead'
import { FileTabs } from '@/components/structures/page/FileTabs'
import { JuniorDrawers } from '@/composites/academy/junior/JuniorDrawers'
import {
  JuniorFileProvider,
  useJuniorState,
  type JuniorFields,
  type JuniorRights,
  type JuniorRows,
  type JuniorSurroundings,
} from '@/composites/academy/junior/JuniorFileContext'
import { JuniorOverview } from '@/composites/academy/junior/JuniorOverview'
import { NotesTab } from '@/composites/academy/junior/NotesTab'
import { ObjectivesTab } from '@/composites/academy/junior/ObjectivesTab'
import { ProgressionTab } from '@/composites/academy/junior/ProgressionTab'
import { JuniorTimeline } from '@/composites/academy/timeline/JuniorTimeline'
import { ResignButton } from '@/composites/academy/junior/ResignButton'
import { ReviewsTab } from '@/composites/academy/junior/ReviewsTab'
import { SkillsTab } from '@/composites/academy/junior/SkillsTab'
import { DecisionFlow } from '@/composites/academy/review/DecisionFlow'
import { ReviewFlow } from '@/composites/academy/review/ReviewFlow'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { FSI_TABS, GUIDE_BEACONS } from '@/declarations/academy/guides'
import { PARKOUR_PHASES } from '@/declarations/academy/parkour'
import { ACADEMY_JUNIOR_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'

/**
 * Head, tabs and flows of the open junior
 * @param {Object} props - Component props
 * @param {ActivityEntry[]} props.activity - Journal entries
 * @return {JSX.Element}
 */

const JuniorBody = ({ activity }: { activity: ActivityEntry[] }) => {
  const { file, can, fields, recruitmentPath, tab, setTab, flow, setFlow } = useJuniorState()
  const { junior } = file
  const status = ACADEMY_JUNIOR_STATUS_REGISTRY.get(junior.status)
  const closeFlow = () => setFlow(null)

  return (
    <div className="flex flex-col gap-8" {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.fsiTabs }}>
      <FileHead
        lead={<Avatar name={junior.displayName} src={junior.avatarUrl} size="xl" />}
        title={junior.displayName}
        meta={
          <>
            <Status label={status.label} accent={status.accent} icon="statusDot" />
            <span>{PARKOUR_PHASES[junior.phase].label}</span>
            {recruitmentPath && (
              <Link href={recruitmentPath} className="font-semibold underline">
                {ACADEMY_COPY.recruitmentFile}
              </Link>
            )}
          </>
        }
        actions={<ResignButton />}
      />

      <FileTabs
        label={ACADEMY_COPY.fileTitle}
        value={tab}
        onChange={setTab}
        tabs={[
          {
            value: FSI_TABS.informations,
            label: SESSION_FILE_COPY.tabOverview,
            icon: 'sheet',
            render: () => <JuniorOverview />,
          },
          {
            value: FSI_TABS.timeline,
            label: ACADEMY_COPY.timelineTab,
            icon: 'clock',
            render: () => <JuniorTimeline />,
          },
          {
            value: FSI_TABS.trainings,
            label: ACADEMY_COPY.progression,
            icon: 'academy',
            render: () => <ProgressionTab />,
          },
          {
            value: FSI_TABS.skills,
            label: ACADEMY_COPY.tabCompetences,
            icon: 'skill',
            render: () => <SkillsTab />,
          },
          {
            value: FSI_TABS.notes,
            label: ACADEMY_COPY.tabNotes,
            icon: 'note',
            render: () => <NotesTab />,
          },
          {
            value: FSI_TABS.objectives,
            label: ACADEMY_COPY.tabObjectives,
            icon: 'objective',
            visible: can.readObjectives,
            render: () => <ObjectivesTab />,
          },
          {
            value: FSI_TABS.reviews,
            label: ACADEMY_COPY.tabReviews,
            icon: 'confirm',
            render: () => <ReviewsTab />,
          },
          {
            value: 'logs',
            label: SESSION_FILE_COPY.tabLogs,
            icon: 'history',
            visible: can.readLogs,
            render: () => <ActivityPanel entries={activity} />,
          },
        ]}
      />

      <JuniorDrawers />
      {flow === 'reviews' && (
        <ReviewFlow queue={[junior]} fields={fields.review} onClose={closeFlow} />
      )}
      {flow === 'decisions' && <DecisionFlow queue={[junior]} onClose={closeFlow} />}
    </div>
  )
}

export interface JuniorFileProps {
  rows: JuniorRows
  surroundings: JuniorSurroundings
  fields: JuniorFields
  can: JuniorRights
  activity: ActivityEntry[]
  initialTab?: string
}

/**
 * Individual follow-up file of one junior
 * @param {JuniorRows} rows - Rows resolved server-side
 * @param {JuniorSurroundings} surroundings - Promotion, timeline, periods, lives and courses
 * @param {JuniorFields} fields - Declarations of the forms
 * @param {JuniorRights} can - What the viewer may do
 * @param {ActivityEntry[]} activity - Journal entries
 * @param {string} [initialTab] - Tab a walkthrough opens on
 * @return {JSX.Element}
 */

export const JuniorFile = ({
  rows,
  surroundings,
  fields,
  can,
  activity,
  initialTab,
}: JuniorFileProps) => (
  <JuniorFileProvider
    rows={rows}
    surroundings={surroundings}
    fields={fields}
    can={can}
    initialTab={initialTab}
  >
    <JuniorBody activity={activity} />
  </JuniorFileProvider>
)
