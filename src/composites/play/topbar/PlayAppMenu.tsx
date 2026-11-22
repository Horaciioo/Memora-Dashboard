import AppLink from '@/components/elements/navigation/AppLink'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HOME_COPY } from '@/declarations/play'
import { NESTED_BOX } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_TABS, PLAY_TOPBAR } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * App switch under the logo: Play (here) and the dashboard
 * @param {Object} props - Menu
 * @param {() => void} props.onClose - Fold the menu
 * @return {JSX.Element}
 */

export const PlayAppMenu = ({ onClose }: { onClose: () => void }) => {
  const HereIcon = ICONS.check
  const DashboardIcon = ICONS.dashboard

  return (
    <div
      role="menu"
      aria-label={PLAY_HOME_COPY.apps}
      className={cn(PLAY_TOPBAR.menu, PLAY_TOPBAR.appsMenu, NESTED_BOX.frame)}
    >
      <div className={NESTED_BOX.group}>
        <AppLink
          role="menuitem"
          href={ROUTES.play}
          onClick={onClose}
          className={PLAY_TABS.menuItem}
        >
          <HereIcon className={PLAY_TABS.menuIcon} aria-hidden="true" />
          <span className={PLAY_TABS.menuText}>{PLAY_HOME_COPY.brand}</span>
        </AppLink>
        <AppLink
          role="menuitem"
          href={ROUTES.dashboard}
          onClick={onClose}
          className={PLAY_TABS.menuItem}
        >
          <DashboardIcon className={PLAY_TABS.menuIcon} aria-hidden="true" />
          <span className={PLAY_TABS.menuText}>{PLAY_HOME_COPY.dashboard}</span>
        </AppLink>
      </div>
    </div>
  )
}
