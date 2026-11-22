'use client'

import AppLink from '@/components/elements/navigation/AppLink'
import { PLAY_TAB_LABELS } from '@/composites/play/mobile/tabs'
import { PlayTabGlyph } from '@/composites/play/mobile/PlayTabGlyphs'
import { AvailabilityMenu } from '@/composites/shell/account/AvailabilityMenu'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_ME_COPY } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY } from '@/declarations/play/admin'
import { NESTED_BOX } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_TABS, PLAY_TOPBAR } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Box under the portrait, three groups: status and admin, own pages, way out
 * @param {Object} props - Menu
 * @param {() => void} props.onClose - Fold the menu
 * @param {boolean} [props.isTop] - Opens under the top bar
 * @param {string} [props.menuClassName] - Placement override
 * @return {JSX.Element}
 */

export const PlayMeMenu = ({
  onClose,
  isTop,
  menuClassName,
}: {
  onClose: () => void
  isTop?: boolean
  menuClassName?: string
}) => {
  const { can, session } = useAuthContext()
  const SettingsIcon = ICONS.settings
  const AdminIcon = ICONS.shield
  const LeaveIcon = ICONS.playLeave

  return (
    <div
      role="menu"
      className={cn(isTop ? PLAY_TOPBAR.menu : PLAY_TABS.menu, NESTED_BOX.frame, menuClassName)}
    >
      <div className={NESTED_BOX.group}>
        {isTop && <p className={PLAY_TABS.menuHeading}>{PLAY_ME_COPY.account}</p>}
        {isTop && session && (
          <>
            <button
              type="button"
              role="menuitem"
              data-play-card={session.id}
              onClick={onClose}
              className={PLAY_TABS.menuItem}
            >
              <PlayTabGlyph name="group" className={PLAY_TABS.menuIcon} />
              <span className={PLAY_TABS.menuText}>{PLAY_ME_COPY.open}</span>
            </button>
            <span className={NESTED_BOX.rule} aria-hidden="true" />
          </>
        )}
        <AvailabilityMenu rowClassName={PLAY_TABS.menuItem} optionClassName={PLAY_TABS.menuItem} />
        {can(Permissions.PlayManage) && (
          <>
            <span className={NESTED_BOX.rule} aria-hidden="true" />
            <AppLink
              role="menuitem"
              href={ROUTES.playAdmin}
              onClick={onClose}
              className={PLAY_TABS.menuItem}
            >
              <AdminIcon className={PLAY_TABS.menuIcon} aria-hidden="true" />
              <span className={PLAY_TABS.menuText}>{PLAY_BOARD_ADMIN_COPY.menu}</span>
            </AppLink>
          </>
        )}
      </div>

      <div className={NESTED_BOX.group}>
        {isTop && <p className={PLAY_TABS.menuHeading}>{PLAY_ME_COPY.space}</p>}
        <AppLink
          role="menuitem"
          href={ROUTES.playStats}
          onClick={onClose}
          className={PLAY_TABS.menuItem}
        >
          <PlayTabGlyph name="stats" className={PLAY_TABS.menuIcon} />
          {PLAY_ME_COPY.stats}
        </AppLink>
        {isTop && (
          <AppLink
            role="menuitem"
            href={ROUTES.playFeed}
            onClick={onClose}
            className={PLAY_TABS.menuItem}
          >
            <PlayTabGlyph name="feed" className={PLAY_TABS.menuIcon} />
            {PLAY_TAB_LABELS.feed}
          </AppLink>
        )}
        <AppLink
          role="menuitem"
          href={ROUTES.playSettings}
          onClick={onClose}
          className={PLAY_TABS.menuItem}
        >
          <SettingsIcon className={PLAY_TABS.menuIcon} aria-hidden="true" />
          {PLAY_ME_COPY.settings}
        </AppLink>
      </div>

      {!isTop && (
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
      )}
    </div>
  )
}
