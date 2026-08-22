'use client'

import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { AppearanceToggle } from '@/components/elements/actions/AppearanceToggle'
import { ColorVisionSelect } from '@/components/elements/actions/ColorVisionSelect'
import { ThemeToggle } from '@/components/elements/actions/ThemeToggle'
import { Drawer } from '@/components/structures/Drawer'
import { LogoutButton } from '@/composites/auth/LogoutButton'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { ACCOUNT_BLOCK } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Portrait opening a panel with the member's identity and every display preference
 * @return {JSX.Element | null}
 */

export const AccountMenu = () => {
  const { session } = useAuthContext()
  const [isOpen, setOpen] = useState(false)

  if (!session) return null

  const role = ROLE_REGISTRY.get(session.role)

  return (
    <>
      <Button
        variant="ghost"
        className="shrink-0 px-1"
        aria-label={NAV_COPY.account}
        onClick={() => setOpen(true)}
      >
        <Avatar name={session.displayName} src={session.avatarUrl} />
      </Button>
      <Drawer open={isOpen} onClose={() => setOpen(false)} title={NAV_COPY.account}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Avatar name={session.displayName} src={session.avatarUrl} size="lg" />
            <div className="flex min-w-0 flex-col gap-1">
              <p className={ACCOUNT_BLOCK.name}>{session.displayName}</p>
              <p className={ACCOUNT_BLOCK.meta}>{session.discordId}</p>
              <Badge label={role.label} tone="brand" dot />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">{NAV_COPY.theme}</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">{NAV_COPY.textSize}</span>
              <AppearanceToggle />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">{NAV_COPY.colorVision}</span>
              <ColorVisionSelect />
            </div>
          </div>
          <LogoutButton />
        </div>
      </Drawer>
    </>
  )
}
