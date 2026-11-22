import AppLink from '@/components/elements/navigation/AppLink'
import { PLAY_ADMIN_PAGES, type PlayAdminPage } from '@/composites/play/topbar/topItems'
import { PLAY_SECTION_COPY } from '@/declarations/play'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Pages of the administration on a phone, where the rail is hidden
 * @param {Object} props - Open page
 * @param {PlayAdminPage['key']} props.page - Page shown
 * @return {JSX.Element}
 */

export const PlayAdminTabs = ({ page }: { page: PlayAdminPage['key'] }) => (
  <nav aria-label={PLAY_SECTION_COPY.admin} className={PLAY_ADMIN.phoneTabs}>
    {PLAY_ADMIN_PAGES.map((entry) => (
      <AppLink
        key={entry.key}
        href={entry.href}
        aria-current={entry.key === page ? 'page' : undefined}
        className={cn(PLAY_ADMIN.phoneTab, entry.key === page && PLAY_ADMIN.phoneTabOn)}
      >
        {entry.label}
      </AppLink>
    ))}
  </nav>
)
