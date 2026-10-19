import { Avatar } from '@/components/elements/display/Avatar'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { CREATOR_BILAN } from '@/declarations/ui/variants'
import { formatDay } from '@/utils/format/dates'

export interface CreatorHeroProps {
  creator: { name: string; avatar: string | null; banner: string | null }
  start: string
}

/**
 * Poster of the creator bilan: their face, their name, the day of the live
 * @param {CreatorHeroProps} props - Creator and live start
 * @return {JSX.Element}
 */

export const CreatorHero = ({ creator, start }: CreatorHeroProps) => {
  const backdrop = creator.banner ?? creator.avatar

  return (
    <header className={CREATOR_BILAN.hero}>
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={backdrop} alt="" className={CREATOR_BILAN.backdrop} />
      )}
      <div className={CREATOR_BILAN.wash} aria-hidden="true" />
      <div className={CREATOR_BILAN.halo} aria-hidden="true" />
      <div className={CREATOR_BILAN.heroRow}>
        <Avatar
          name={creator.name}
          src={creator.avatar}
          size="hero"
          className={CREATOR_BILAN.portrait}
        />
        <div>
          <p className={CREATOR_BILAN.eyebrow}>{LIVE_REPORT_COPY.creatorKicker}</p>
          <h2 className={CREATOR_BILAN.name}>{creator.name}</h2>
          <p className={CREATOR_BILAN.day}>{formatDay(start)}</p>
        </div>
      </div>
    </header>
  )
}
