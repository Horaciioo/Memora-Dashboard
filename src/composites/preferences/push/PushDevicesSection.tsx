'use client'

import { Button } from '@/components/elements/actions/Button'
import { Section } from '@/components/structures/page/Section'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { PUSH_COPY } from '@/declarations/pwa/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PREFERENCE_STYLES, PUSH_STYLES } from '@/declarations/ui/variants'
import type { PushDeviceView } from '@/types/push'
import { formatDay } from '@/utils/format/dates'
import { deviceLabel, readDevice } from '@/utils/format/device'

export interface PushDevicesSectionProps {
  devices: PushDeviceView[]
  currentEndpoint: string | null
  onForget: (id: string) => void
}

/**
 * Browsers that receive the member's pushes
 * @param {PushDeviceView[]} devices - Subscribed browsers
 * @param {string | null} currentEndpoint - This browser
 * @param {(id: string) => void} onForget - Removes one
 * @return {JSX.Element}
 */

export const PushDevicesSection = ({
  devices,
  currentEndpoint,
  onForget,
}: PushDevicesSectionProps) => (
  <Section title={PUSH_COPY.devicesTitle} description={PUSH_COPY.devicesLead} padded>
    {devices.length === 0 ? (
      <p className={PUSH_STYLES.journalMuted}>{PUSH_COPY.noDevice}</p>
    ) : (
      <div className={PREFERENCE_STYLES.rows}>
        {devices.map((device) => {
          const Glyph = ICONS[readDevice(device.device).icon]
          const isCurrent = device.endpoint === currentEndpoint

          return (
            <div key={device.id} className={PREFERENCE_STYLES.row}>
              <div className={PUSH_STYLES.deviceName}>
                <span className={PUSH_STYLES.deviceTitle}>
                  <Glyph className={PUSH_STYLES.deviceIcon} aria-hidden="true" />
                  {isCurrent
                    ? PUSH_COPY.thisDevice
                    : deviceLabel(device.device, PREFERENCES_COPY.unknownDevice)}
                </span>
                <span className={PUSH_STYLES.deviceMeta}>
                  {`${PUSH_COPY.subscribedOn} ${formatDay(device.createdAt)}`}
                  {device.lastSentAt &&
                    ` · ${PUSH_COPY.lastSentOn} ${formatDay(device.lastSentAt)}`}
                </span>
              </div>
              <Button
                variant="ghost"
                icon="close"
                aria-label={PUSH_COPY.removeDevice}
                title={PUSH_COPY.removeDevice}
                onClick={() => onForget(device.id)}
              />
            </div>
          )
        })}
      </div>
    )}
  </Section>
)
