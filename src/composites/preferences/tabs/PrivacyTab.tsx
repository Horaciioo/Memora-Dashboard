'use client'

import { SettingsGroup } from '@/composites/preferences/SettingsGroup'
import { TipList } from '@/composites/preferences/TipList'
import { PrivacyActions } from '@/composites/security/PrivacyActions'
import type { ProfileState } from '@/core/hooks/data/people/useProfile'
import { PRIVACY_COPY } from '@/declarations/preferences/settings'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'

export interface PrivacyTabProps {
  state: ProfileState
}

/**
 * Privacy: what is kept, the export, the erasure
 * @param {ProfileState} state - File and its mutations
 * @return {JSX.Element}
 */

export const PrivacyTab = ({ state }: PrivacyTabProps) => (
  <div className={PREFERENCE_STYLES.stack}>
    <SettingsGroup title={PRIVACY_COPY.keepTitle}>
      <TipList items={PRIVACY_COPY.keeps} />
    </SettingsGroup>
    <PrivacyActions isBusy={state.isSaving} onErase={state.eraseDetails} />
  </div>
)
