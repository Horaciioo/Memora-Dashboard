'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { SettingRow } from '@/composites/preferences/SettingRow'
import { SettingsGroup } from '@/composites/preferences/SettingsGroup'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { PRIVACY_COPY } from '@/declarations/preferences/settings'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'

export interface PrivacyActionsProps {
  isBusy: boolean
  onExport: () => void
  onErase: () => Promise<boolean>
}

/**
 * Take the data away, or erase the private part of it
 * @param {boolean} isBusy - A request is in flight
 * @param {() => void} onExport - Download handler
 * @param {() => Promise<boolean>} onErase - Erase handler
 * @return {JSX.Element}
 */

export const PrivacyActions = ({ isBusy, onExport, onErase }: PrivacyActionsProps) => {
  const [isAsking, setAsking] = useState(false)

  return (
    <SettingsGroup title={PREFERENCES_COPY.dataTitle}>
      <div className={PREFERENCE_STYLES.rows}>
        <SettingRow
          icon="install"
          name={PRIVACY_COPY.exportTitle}
          description={PRIVACY_COPY.exportLead}
        >
          <Button variant="secondary" disabled={isBusy} onClick={onExport}>
            {isBusy ? PREFERENCES_COPY.exportPending : PREFERENCES_COPY.exportAction}
          </Button>
        </SettingRow>
        <SettingRow
          icon="remove"
          name={PRIVACY_COPY.eraseTitle}
          description={PRIVACY_COPY.eraseLead}
        >
          <Button variant="danger" disabled={isBusy} onClick={() => setAsking(true)}>
            {PREFERENCES_COPY.eraseDetails}
          </Button>
        </SettingRow>
      </div>
      <ConfirmDialog
        open={isAsking}
        title={PREFERENCES_COPY.eraseConfirmTitle}
        description={PREFERENCES_COPY.eraseConfirmDescription}
        confirmLabel={PREFERENCES_COPY.eraseDetails}
        tone="danger"
        pending={isBusy}
        onCancel={() => setAsking(false)}
        onConfirm={() => void onErase().then(() => setAsking(false))}
      />
    </SettingsGroup>
  )
}
