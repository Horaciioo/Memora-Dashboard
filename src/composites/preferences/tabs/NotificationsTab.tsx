'use client'

import { PushPreferences } from '@/composites/preferences/push/PushPreferences'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'
import type { PushSettingsView } from '@/types/push'

export interface NotificationsTabProps {
  push: { publicKey: string | null; settings: PushSettingsView }
}

/**
 * Notifications: this device, families, subscribed browsers
 * @param {Object} push - Server key and push settings
 * @return {JSX.Element}
 */

export const NotificationsTab = ({ push }: NotificationsTabProps) => (
  <div className={PREFERENCE_STYLES.stack}>
    <PushPreferences publicKey={push.publicKey} initial={push.settings} />
  </div>
)
