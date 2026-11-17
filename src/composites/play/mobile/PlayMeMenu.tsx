'use client'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayTabGlyph } from '@/composites/play/mobile/PlayTabGlyphs'
import { AvailabilityMenu } from '@/composites/shell/account/AvailabilityMenu'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_ME_COPY } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY } from '@/declarations/play/admin'
import { NESTED_BOX } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_TABS } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Box under the portrait, three groups: status and trophies, own pages, way out
 * @param {Object} props - Menu
 * @param {() => void} props.onClose - Fold the menu
 * @param {() => void} props.onTrophies - Open the trophies window
 * @return {JSX.Element}
 */

export const PlayMeMenu = ({
  onClose,
  onTrophies,
}: {
  onClose: () => void
  onTrophies: () => void
}) => {
  const { can } = useAuthContext()
  const TrophyIcon = ICONS.playTrophy
  const SettingsIcon = ICONS.settings
  const AdminIcon = ICONS.shield
  const LeaveIcon = ICONS.playLeave
  const Caret = ICONS.next

  return (
    <div role="menu" className={cn(PLAY_TABS.menu, NESTED_BOX.frame)}>
      <div className={NESTED_BOX.group}>
        <AvailabilityMenu rowClassName={PLAY_TABS.menuItem} optionClassName={PLAY_TABS.menuItem} />
        <span className={NESTED_BOX.rule} aria-hidden="true" />
        <button type="button" role="menuitem" onClick={onTrophies} className={PLAY_TABS.menuItem}>
          <TrophyIcon className={PLAY_TABS.menuIcon} aria-hidden="true" />
          <span className={PLAY_TABS.menuText}>{PLAY_ME_COPY.trophies}</span>
          <Caret className={PLAY_TABS.menuCaret} aria-hidden="true" />
        </button>
      </div>

      <div className={NESTED_BOX.group}>
        <AppLink
          role="menuitem"
          href={ROUTES.playStats}
          onClick={onClose}
          className={PLAY_TABS.menuItem}
        >
          <PlayTabGlyph name="stats" className={PLAY_TABS.menuIcon} />
          {PLAY_ME_COPY.stats}
        </AppLink>
        <AppLink
          role="menuitem"
          href={ROUTES.playSettings}
          onClick={onClose}
          className={PLAY_TABS.menuItem}
        >
          <SettingsIcon className={PLAY_TABS.menuIcon} aria-hidden="true" />
          {PLAY_ME_COPY.settings}
        </AppLink>
        {can(Permissions.PlayManage) && (
          <AppLink
            role="menuitem"
            href={ROUTES.playAdmin}
            onClick={onClose}
            className={PLAY_TABS.menuItem}
          >
            <AdminIcon className={PLAY_TABS.menuIcon} aria-hidden="true" />
            {PLAY_BOARD_ADMIN_COPY.menu}
          </AppLink>
        )}
      </div>

      <div className={NESTED_BOX.group}>
        <AppLink
          role="menuitem"
          href={ROUTES.dashboard}
          className={cn(PLAY_TABS.menuItem, PLAY_TABS.menuLeave)}
        >
          <LeaveIcon className={PLAY_TABS.menuIcon} aria-hidden="true" />
          {PLAY_ME_COPY.leave}
        </AppLink>
      </div>
    </div>
  )
}
