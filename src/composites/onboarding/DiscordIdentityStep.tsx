'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ONBOARDING_DISCORD_COPY } from '@/declarations/onboarding/copy'
import { INTEGRATION_ERRORS, type IntegrationErrorName } from '@/declarations/onboarding/failures'
import { ONBOARDING_STYLES } from '@/declarations/ui/variants'
import type { IntegrationClaimView } from '@/types/onboarding'

export interface DiscordIdentityStepProps {
  token: string
  claim: IntegrationClaimView | null
  failure: IntegrationErrorName | null
  confirmed: boolean
  onConfirm: (confirmed: boolean) => void
}

/**
 * Identity gate of the integration form — Discord itself proves the account is theirs
 * @param {string} token - Link token
 * @param {IntegrationClaimView | null} claim - Identity the server resolved
 * @param {IntegrationErrorName | null} failure - Why the last attempt was refused
 * @param {boolean} confirmed - Identity acknowledged by the person
 * @param {(confirmed: boolean) => void} onConfirm - Acknowledgement handler
 * @return {JSX.Element}
 */

export const DiscordIdentityStep = ({
  token,
  claim,
  failure,
  confirmed,
  onConfirm,
}: DiscordIdentityStepProps) => {
  const connect = () => window.location.assign(API_ROUTES.integrationDiscord(token))

  const warning = (
    <div className={ONBOARDING_STYLES.notice}>
      <span className={ONBOARDING_STYLES.noticeTitle}>{ONBOARDING_DISCORD_COPY.warningTitle}</span>
      <p>{ONBOARDING_DISCORD_COPY.warningBody}</p>
    </div>
  )

  // A refused round trip owes the person a reason and a way back in
  if (failure) {
    const taken = failure === INTEGRATION_ERRORS.Taken

    return (
      <div className={ONBOARDING_STYLES.body}>
        <div className={ONBOARDING_STYLES.intro}>
          <p className={ONBOARDING_STYLES.heading}>
            {taken ? ONBOARDING_DISCORD_COPY.takenTitle : ONBOARDING_DISCORD_COPY.failureTitle}
          </p>
          <p className={ONBOARDING_STYLES.lead}>
            {taken ? ONBOARDING_DISCORD_COPY.takenBody : ONBOARDING_DISCORD_COPY.failureBody}
          </p>
        </div>
        {warning}
        <div className={ONBOARDING_STYLES.actions}>
          <Button variant="primary" icon="refresh" onClick={connect}>
            {ONBOARDING_DISCORD_COPY.retry}
          </Button>
        </div>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className={ONBOARDING_STYLES.body}>
        <p className={ONBOARDING_STYLES.lead}>{ONBOARDING_DISCORD_COPY.lead}</p>
        {warning}
        <div className={ONBOARDING_STYLES.actions}>
          <Button variant="primary" icon="discord" onClick={connect}>
            {ONBOARDING_DISCORD_COPY.connect}
          </Button>
        </div>
      </div>
    )
  }

  const name = claim.displayName ?? claim.discordId

  return (
    <div className={ONBOARDING_STYLES.body}>
      <div className={ONBOARDING_STYLES.identity}>
        <Avatar name={name} src={claim.avatarUrl} size="lg" />
        <div className="flex min-w-0 flex-col">
          <span className={ONBOARDING_STYLES.identityName}>{name}</span>
          <span className={ONBOARDING_STYLES.identityHandle}>{claim.discordId}</span>
        </div>
      </div>
      {warning}
      <div className={ONBOARDING_STYLES.actions}>
        <Button
          variant={confirmed ? 'secondary' : 'primary'}
          icon="confirm"
          onClick={() => onConfirm(true)}
        >
          {ONBOARDING_DISCORD_COPY.confirm}
        </Button>
        <Button icon="close" onClick={connect}>
          {ONBOARDING_DISCORD_COPY.reject}
        </Button>
      </div>
    </div>
  )
}
