import type { NavigationItem } from '@/declarations/navigation'
import { DOCK_COPY } from '@/declarations/pwa/copy'
import { MOBILE_DOCK } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import type { LucideIcon } from '@/declarations/ui/icons'
import { railIcon } from '@/declarations/ui/railIcons'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { DOCK_PHONE, SKELETON_BASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface DockPhoneProps {
  left: NavigationItem[]
  right: NavigationItem[]
}

// Glyph of the middle button
const HOME_ICON = railIcon('dashboard')

/**
 * Skeleton block
 * @param {Object} props - Block
 * @param {string} props.className - Size classes
 * @return {JSX.Element}
 */

const Bone = ({ className }: { className: string }) => (
  <div aria-hidden="true" className={cn(SKELETON_BASE, className)} />
)

/**
 * One dock page, not clickable
 * @param {Object} props - Entry
 * @param {NavigationItem} props.item - Destination
 * @param {LucideIcon} props.Icon - Glyph
 * @return {JSX.Element}
 */

const PhoneEntry = ({ item, Icon }: { item: NavigationItem; Icon: LucideIcon }) => (
  <div aria-label={item.label} className={cn(DOCK_PHONE.item, MOBILE_DOCK.itemRest)}>
    <Icon className={MOBILE_DOCK.icon} aria-hidden="true" />
  </div>
)

/**
 * iPhone showing the dock as it will be
 * @param {NavigationItem[]} left - Pages left of Home
 * @param {NavigationItem[]} right - Pages right of Home
 * @return {JSX.Element}
 */

export const DockPhone = ({ left, right }: DockPhoneProps) => {
  const MenuIcon = ICONS.menu

  return (
    <div className={DOCK_PHONE.host}>
      <div role="img" aria-label={DOCK_COPY.preview} className={DOCK_PHONE.device}>
        <span className={DOCK_PHONE.buttonLeft} />
        <span className={DOCK_PHONE.buttonLeftTall} />
        <span className={DOCK_PHONE.buttonRight} />
        <div className={DOCK_PHONE.screen}>
          <span className={DOCK_PHONE.island} />
          {/* Status bar */}
          <div className={DOCK_PHONE.status}>
            <Bone className="h-2.5 w-8" />
            <div className={DOCK_PHONE.statusIcons}>
              <Bone className="h-2.5 w-3" />
              <Bone className="h-2.5 w-4" />
            </div>
          </div>
          {/* Page behind the dock */}
          <div className={DOCK_PHONE.content}>
            <Bone className="h-5 w-2/3" />
            <Bone className="h-24 w-full" />
            <Bone className="h-12 w-full" />
            <Bone className="h-12 w-full" />
            <Bone className="h-12 w-full" />
          </div>
          {/* The dock itself */}
          <div className={DOCK_PHONE.bar}>
            {left.map((item) => (
              <PhoneEntry key={item.href} item={item} Icon={railIcon(item.icon)} />
            ))}
            <div
              aria-label={NAV_COPY.home}
              className={cn(MOBILE_DOCK.home, MOBILE_DOCK.homeActive)}
            >
              <HOME_ICON className={MOBILE_DOCK.homeIcon} aria-hidden="true" />
            </div>
            {right.map((item) => (
              <PhoneEntry key={item.href} item={item} Icon={railIcon(item.icon)} />
            ))}
            <div aria-label={DOCK_COPY.menu} className={cn(DOCK_PHONE.item, MOBILE_DOCK.itemRest)}>
              <MenuIcon className={MOBILE_DOCK.icon} aria-hidden="true" />
            </div>
          </div>
          <span className={DOCK_PHONE.indicator} />
        </div>
      </div>
    </div>
  )
}
