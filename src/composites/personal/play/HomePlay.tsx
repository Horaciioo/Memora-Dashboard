import type { CSSProperties } from 'react'

import Link from '@/components/elements/navigation/AppLink'
import { Section } from '@/components/structures/page/Section'
import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { ROUTES } from '@/declarations/navigation'
import { HOME_PLAY_COPY, HOME_PLAY_NEW } from '@/declarations/personal/play'
import { PLAY_GAMES, playKeysOf } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_PLAY as STYLES } from '@/declarations/ui/variants'

/**
 * Latest games as banners
 * @return {JSX.Element}
 */

export const HomePlay = () => {
  const Next = ICONS.next

  return (
    <Section title={HOME_PLAY_COPY.title} bare>
      <div className={STYLES.games}>
        {HOME_PLAY_NEW.map((game) => (
          <Link
            key={game}
            href={ROUTES.playGame(PLAY_GAMES.get(game).slug)}
            className={STYLES.game}
            style={playKeysOf(game) as CSSProperties}
          >
            <PlayGameArt game={game} className={STYLES.gameArt} />
            <span className={STYLES.gameShade} aria-hidden="true" />
            <span className={STYLES.gameBody}>
              <span className={STYLES.gameName}>{PLAY_GAMES.label(game)}</span>
              <span className={STYLES.gameTagline}>{PLAY_GAMES.get(game).tagline}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className={STYLES.openRow}>
        <Link href={ROUTES.play} className={STYLES.open}>
          {HOME_PLAY_COPY.open}
          <Next className={STYLES.moreGlyph} aria-hidden="true" />
        </Link>
      </div>
    </Section>
  )
}
