import { Avatar } from '@/components/elements/display/Avatar'
import { CREATOR_GROUP } from '@/declarations/ui/blocks'
import { LIVE_STAGE } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface CreatorGroupBannerProps {
  name: string
  avatarUrl?: string | null
  bannerUrl?: string | null
  isOpen: boolean
  onToggle: () => void
}

/**
 * Banner of a creator, the one of a live on air, the only thing shown while its moderators are folded
 * @param {string} name - Creator name
 * @param {string | null} [avatarUrl] - Logo
 * @param {string | null} [bannerUrl] - Banner
 * @param {boolean} isOpen - Moderators shown
 * @param {() => void} onToggle - Fold or unfold
 * @return {JSX.Element}
 */

export const CreatorGroupBanner = ({
  name,
  avatarUrl,
  bannerUrl,
  isOpen,
  onToggle,
}: CreatorGroupBannerProps) => {
  const Chevron = ICONS.expand
  const backdrop = bannerUrl ?? avatarUrl

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={onToggle}
      className={CREATOR_GROUP.banner}
    >
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={backdrop} alt="" loading="lazy" className={LIVE_STAGE.backdrop} />
      )}
      <span className={LIVE_STAGE.wash} aria-hidden="true" />
      <Avatar name={name} src={avatarUrl} size="lg" className={CREATOR_GROUP.portrait} />
      <span className={CREATOR_GROUP.name}>{name}</span>
      <Chevron
        className={cn(CREATOR_GROUP.chevron, isOpen && CREATOR_GROUP.chevronOpen)}
        aria-hidden="true"
      />
    </button>
  )
}
