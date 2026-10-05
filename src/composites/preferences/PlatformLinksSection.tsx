'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { NetworkLogo } from '@/components/elements/display/NetworkLogo'
import { Section } from '@/components/structures/Section'
import { unlinkTwitchAccount } from '@/app/(dashboard)/parametres/actions'
import { API_ROUTES } from '@/core/lib/api/routes'
import { PLATFORM_ACCOUNT_COPY } from '@/declarations/platforms/copy'
import { SECURITY_LIST } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES } from '@/declarations/ui/variants'
import type { PlatformLinkView } from '@/types/platforms'
import { cn } from '@/utils/classnames'
import { LivePlatforms } from '@/utils/constants/lives'

export interface PlatformLinksSectionProps {
  links: PlatformLinkView[]
  // Twitch application configured on this server
  twitchAvailable: boolean
}

/**
 * Platform accounts the Mod View acts with
 * @param {PlatformLinkView[]} links - Linked accounts
 * @param {boolean} twitchAvailable - Twitch link offered
 * @return {JSX.Element}
 */

export const PlatformLinksSection = ({ links, twitchAvailable }: PlatformLinksSectionProps) => {
  const [isUnlinking, setUnlinking] = useState(false)
  const twitch = links.find((link) => link.platform === LivePlatforms.Twitch)
  const StatusOn = ICONS.success
  const StatusOff = ICONS.warning

  return (
    <Section title={PLATFORM_ACCOUNT_COPY.title} description={PLATFORM_ACCOUNT_COPY.lead} padded>
      <ul className={SECURITY_LIST.list}>
        <li className={SECURITY_LIST.row}>
          <NetworkLogo network="twitch" className={SECURITY_LIST.glyph} />
          <div className={SECURITY_LIST.body}>
            <p className={SECURITY_LIST.title}>{PLATFORM_ACCOUNT_COPY.twitch}</p>
            <p className={SECURITY_LIST.meta}>
              {!twitchAvailable && !twitch ? (
                PLATFORM_ACCOUNT_COPY.unavailable
              ) : twitch ? (
                <span
                  className={cn(
                    SECURITY_LIST.status,
                    twitch.revoked ? SECURITY_LIST.off : SECURITY_LIST.on
                  )}
                >
                  {twitch.revoked ? (
                    <StatusOff className={SECURITY_LIST.statusGlyph} aria-hidden="true" />
                  ) : (
                    <StatusOn className={SECURITY_LIST.statusGlyph} aria-hidden="true" />
                  )}
                  {twitch.revoked
                    ? PLATFORM_ACCOUNT_COPY.revoked
                    : PLATFORM_ACCOUNT_COPY.linkedAs.replace('{login}', twitch.login)}
                </span>
              ) : (
                PLATFORM_ACCOUNT_COPY.notLinked
              )}
            </p>
          </div>
          {twitchAvailable && (!twitch || twitch.revoked) && (
            // A plain link: the flow leaves for Twitch and comes back
            <a
              href={API_ROUTES.twitchLink}
              className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}
            >
              {twitch ? PLATFORM_ACCOUNT_COPY.relink : PLATFORM_ACCOUNT_COPY.link}
            </a>
          )}
          {twitch && (
            <Button variant="ghost" onClick={() => setUnlinking(true)}>
              {PLATFORM_ACCOUNT_COPY.unlink}
            </Button>
          )}
        </li>
      </ul>

      <ConfirmDialog
        open={isUnlinking}
        title={PLATFORM_ACCOUNT_COPY.unlink}
        description={PLATFORM_ACCOUNT_COPY.unlinkConfirm}
        confirmLabel={PLATFORM_ACCOUNT_COPY.unlink}
        tone="danger"
        onCancel={() => setUnlinking(false)}
        onConfirm={() => {
          setUnlinking(false)
          void unlinkTwitchAccount()
        }}
      />
    </Section>
  )
}
