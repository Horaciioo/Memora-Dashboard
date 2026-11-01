'use client'

import { useState } from 'react'

import { Tabs } from '@/components/elements/navigation/Tabs'
import type { TabItem } from '@/components/elements/navigation/Tabs'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { InlineText } from '@/components/structures/inline/InlineText'
import { DetectionTab } from '@/composites/moderation/offense/DetectionTab'
import { OffenseLadderTab } from '@/composites/moderation/offense/OffenseLadderTab'
import { OffenseProfile } from '@/composites/moderation/offense/OffenseProfile'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_DETECTION_COPY } from '@/declarations/sanctions/detection'
import type { FormValues } from '@/types/forms'
import type { LiveconLevelView } from '@/types/livecon'
import type {
  SanctionMeasureView,
  SanctionOffenseDetail,
  SanctionPanelView,
  SanctionRungInput,
} from '@/types/sanctions'
import type { SanctionGravityName } from '@/utils/constants/moderation'

export interface OffenseSheetProps {
  offense: SanctionOffenseDetail
  panel: SanctionPanelView
  level: LiveconLevelView
  measures: SanctionMeasureView[]
  canManage: boolean
  isSaving: boolean
  onSaveOffense: (id: string, values: FormValues, quiet?: boolean) => Promise<boolean>
  onSaveLadder: (
    id: string,
    levelId: string,
    gravity: SanctionGravityName,
    steps: SanctionRungInput[]
  ) => Promise<boolean>
  onClose: () => void
}

const TABS: TabItem[] = [
  { value: 'profile', label: SANCTION_DETECTION_COPY.profile, icon: 'info' },
  { value: 'ladder', label: SANCTION_DETECTION_COPY.ladder, icon: 'sanctionsPanel' },
  { value: 'detection', label: SANCTION_DETECTION_COPY.detection, icon: 'blockedTerms' },
]

/**
 * One offence opened in full: profile, ladder and detection in three tabs. A manager rewrites any
 * of it by clicking it, nothing carries an edit button
 * @param {OffenseSheetProps} props - Offence
 * @return {JSX.Element}
 */

export const OffenseSheet = ({
  offense,
  panel,
  level,
  measures,
  canManage,
  isSaving,
  onSaveOffense,
  onSaveLadder,
  onClose,
}: OffenseSheetProps) => {
  const [tab, setTab] = useState('profile')

  const saveField = (name: string) => (value: string) =>
    onSaveOffense(offense.id, { [name]: value })

  return (
    <Drawer
      open
      isWide
      onClose={onClose}
      icon="sanctions"
      title={
        <InlineText
          id="offense-name"
          value={offense.name}
          disabled={!canManage}
          maxLength={FORM_SETTINGS.titleMaxLength}
          onCommit={saveField('name')}
        />
      }
      subheader={
        <Tabs
          items={TABS}
          value={tab}
          onChange={setTab}
          label={SANCTION_DETECTION_COPY.tabs}
          centered
        />
      }
    >
      {tab === 'profile' && (
        <OffenseProfile
          offense={offense}
          level={level}
          canManage={canManage}
          onSaveField={saveField}
        />
      )}
      {tab === 'ladder' && (
        <OffenseLadderTab
          offense={offense}
          level={level}
          measures={measures}
          canManage={canManage}
          isSaving={isSaving}
          onSaveLadder={onSaveLadder}
        />
      )}
      {tab === 'detection' && (
        <DetectionTab
          offense={offense}
          panel={panel}
          canManage={canManage}
          onSave={onSaveOffense}
        />
      )}
    </Drawer>
  )
}
