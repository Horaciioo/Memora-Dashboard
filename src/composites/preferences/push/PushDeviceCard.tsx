'use client'

import { Button } from '@/components/elements/actions/Button'
import { PhoneGlyph } from '@/components/elements/display/glyphs/DeviceGlyphs'
import { PUSH_COPY } from '@/declarations/pwa/copy'
import { PUSH_INVITE } from '@/declarations/ui/variants'

export interface PushDeviceCardProps {
  isOn: boolean
  isBusy: boolean
  blocked: string | null
  onEnable: () => void
  onDisable?: () => void
  onTrial?: () => void
}

/**
 * Invitation to switch pushes on for this device
 * @param {boolean} isOn - This device is subscribed
 * @param {boolean} isBusy - Request in flight
 * @param {string | null} blocked - Why the switch cannot be offered
 * @param {() => void} onEnable - Turns pushes on
 * @param {() => void} [onDisable] - Turns pushes off
 * @param {() => void} [onTrial] - Sends a trial
 * @return {JSX.Element}
 */

export const PushDeviceCard = ({
  isOn,
  isBusy,
  blocked,
  onEnable,
  onDisable,
  onTrial,
}: PushDeviceCardProps) => {
  return (
    <div className={PUSH_INVITE.card}>
      <span className={PUSH_INVITE.wash} aria-hidden="true" />
      <span className={PUSH_INVITE.orb} aria-hidden="true">
        {!isOn && !blocked && (
          <>
            <span className={PUSH_INVITE.ring} />
            <span className={PUSH_INVITE.ring} />
          </>
        )}
        <PhoneGlyph className={`${PUSH_INVITE.phone} ${isOn ? '' : 'push-orb-bell'}`} />
      </span>
      <div className={PUSH_INVITE.body}>
        <p className={PUSH_INVITE.title}>{isOn ? PUSH_COPY.enabledTitle : PUSH_COPY.inviteTitle}</p>
        <p className={PUSH_INVITE.lead}>{isOn ? PUSH_COPY.enabled : PUSH_COPY.deviceLead}</p>
        {blocked && <p className={PUSH_INVITE.hint}>{blocked}</p>}
      </div>
      <div className={PUSH_INVITE.actions}>
        {!blocked && isOn && onTrial && (
          <Button variant="secondary" icon="bell" disabled={isBusy} onClick={onTrial}>
            {PUSH_COPY.testAction}
          </Button>
        )}
        {!blocked && isOn && onDisable && (
          <Button variant="ghost" icon="bellOff" disabled={isBusy} onClick={onDisable}>
            {PUSH_COPY.disable}
          </Button>
        )}
        {!blocked && !isOn && (
          <Button
            variant="primary"
            icon="bell"
            className={PUSH_INVITE.cta}
            disabled={isBusy}
            onClick={onEnable}
          >
            {isBusy ? PUSH_COPY.pending : PUSH_COPY.enable}
          </Button>
        )}
      </div>
    </div>
  )
}
