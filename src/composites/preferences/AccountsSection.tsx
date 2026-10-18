'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { NetworkLogo } from '@/components/elements/display/marks/NetworkLogo'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { Section } from '@/components/structures/page/Section'
import { unlinkPlatformAccount } from '@/app/(dashboard)/parametres/actions'
import { useActionMenu } from '@/core/hooks/interaction/layout/useActionMenu'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ROUTES } from '@/declarations/navigation'
import { LINK_RESULT, accountPageOf } from '@/declarations/platforms/link'
import { ACCOUNT_NAME_COPY, PLATFORM_ACCOUNT_COPY } from '@/declarations/platforms/copy'
import { platformLogoOf } from '@/declarations/platforms/logos'
import { SECURITY_LIST } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES } from '@/declarations/ui/variants'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { MenuItem } from '@/managers/front-end'
import type { PlatformLinkView } from '@/types/platforms'
import { cn } from '@/utils/classnames'
import { LivePlatforms } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'

// Where each platform starts its link
const LINK_ROUTES: Record<LivePlatformName, string> = {
  [LivePlatforms.Twitch]: API_ROUTES.twitchLink,
  [LivePlatforms.YouTube]: API_ROUTES.youtubeLink,
}

export interface AccountsSectionProps {
  // Discord account the member signed in with
  discord: { id: string; username: string }
  links: PlatformLinkView[]
  // Platforms whose application is declared on this server
  available: Record<LivePlatformName, boolean>
  // Outcome of the link the member just came back from
  returned: { platform: LivePlatformName; result: string } | null
}

/**
 * Name of a platform as the member reads it
 * @param {string} key - Logo key
 * @return {string} - Label
 */

const labelOf = (key: string): string => platformLogoOf(key)?.label ?? key

/**
 * Accounts linked to the member
 * @param {{ id: string, username: string }} discord - Sign-in account
 * @param {PlatformLinkView[]} links - Linked platform accounts
 * @param {Record<LivePlatformName, boolean>} available - Platforms that can be linked here
 * @param {{ platform: LivePlatformName, result: string } | null} returned - Link just ended
 * @return {JSX.Element}
 */

export const AccountsSection = ({ discord, links, available, returned }: AccountsSectionProps) => {
  const router = useRouter()
  const { notify } = useNotifications()
  const [leaving, setLeaving] = useState<LivePlatformName | null>(null)
  const StatusOff = ICONS.warning

  // Say how the link ended, then clean the address
  useEffect(() => {
    if (!returned) return

    const platform = labelOf(returned.platform.toLowerCase())
    const linked = returned.result === LINK_RESULT.linked
    notify({
      tone: linked ? 'success' : 'caution',
      title: (linked ? PLATFORM_ACCOUNT_COPY.linked : PLATFORM_ACCOUNT_COPY.failed).replace(
        '{platform}',
        platform
      ),
    })
    router.replace(ROUTES.preferences)
    // Only once per return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const linkedPlatforms = new Set(links.map((link) => link.platform))
  const menuItems: MenuItem[] = Object.values(LivePlatforms)
    .filter((platform) => !linkedPlatforms.has(platform))
    .map((platform) => {
      const label = labelOf(platform.toLowerCase())

      return {
        id: platform,
        label: available[platform]
          ? label
          : PLATFORM_ACCOUNT_COPY.unconfigured.replace('{platform}', label),
        disabled: !available[platform],
        // The flow leaves for the platform and comes back
        onSelect: () => window.location.assign(LINK_ROUTES[platform]),
      }
    })
  const addMenu = useActionMenu(menuItems, PLATFORM_ACCOUNT_COPY.add)

  const row = (
    key: string,
    handle: string,
    name: string,
    actions?: React.ReactNode,
    warning?: string
  ) => {
    const page = accountPageOf(key, handle)

    return (
      <li key={key} className={SECURITY_LIST.row}>
        <NetworkLogo network={key} className={SECURITY_LIST.glyph} />
        <div className={SECURITY_LIST.body}>
          <p className={SECURITY_LIST.title}>{name}</p>
          <a
            href={page.href}
            target="_blank"
            rel="noreferrer"
            className={SECURITY_LIST.link}
            style={{ color: platformLogoOf(key)?.paint }}
          >
            {page.label}
          </a>
          {warning && (
            <p className={cn(SECURITY_LIST.status, SECURITY_LIST.off)}>
              <StatusOff className={SECURITY_LIST.statusGlyph} aria-hidden="true" />
              {warning}
            </p>
          )}
        </div>
        {actions && <div className={SECURITY_LIST.actions}>{actions}</div>}
      </li>
    )
  }

  const leavingLabel = leaving ? labelOf(leaving.toLowerCase()) : ''

  return (
    <Section title={PLATFORM_ACCOUNT_COPY.title} description={PLATFORM_ACCOUNT_COPY.lead} padded>
      <ul className={SECURITY_LIST.list}>
        {row(
          'discord',
          discord.id,
          ACCOUNT_NAME_COPY.discord
            .replace('{username}', discord.username)
            .replace('{id}', discord.id)
        )}
        {links.map((link) => {
          const key = link.platform.toLowerCase()

          return row(
            key,
            link.handle,
            labelOf(key),
            <>
              {link.revoked && available[link.platform] && (
                <a
                  href={LINK_ROUTES[link.platform]}
                  className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}
                >
                  {PLATFORM_ACCOUNT_COPY.relink}
                </a>
              )}
              <Button variant="ghost" onClick={() => setLeaving(link.platform)}>
                {PLATFORM_ACCOUNT_COPY.unlink}
              </Button>
            </>,
            link.revoked ? PLATFORM_ACCOUNT_COPY.revoked : undefined
          )
        })}
      </ul>

      {menuItems.length > 0 && (
        <div className={SECURITY_LIST.footer}>
          <Button variant="secondary" icon="add" onClick={addMenu.onClick}>
            {PLATFORM_ACCOUNT_COPY.add}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={leaving !== null}
        title={PLATFORM_ACCOUNT_COPY.unlink}
        description={PLATFORM_ACCOUNT_COPY.unlinkConfirm.replace('{platform}', leavingLabel)}
        confirmLabel={PLATFORM_ACCOUNT_COPY.unlink}
        tone="danger"
        onCancel={() => setLeaving(null)}
        onConfirm={() => {
          const platform = leaving
          setLeaving(null)
          if (!platform) return

          void unlinkPlatformAccount(platform).then(() =>
            notify({
              tone: 'success',
              title: PLATFORM_ACCOUNT_COPY.unlinked.replace('{platform}', leavingLabel),
            })
          )
        }}
      />
    </Section>
  )
}
