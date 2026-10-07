import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { HOME_HERO } from '@/declarations/ui/variants'

export interface HomeHeaderProps {
  name: string
}

/**
 * Greeting under the banner, the day on the same line at the far right
 * @param {string} name - Signed-in member
 * @return {JSX.Element}
 */

export const HomeHeader = ({ name }: HomeHeaderProps) => (
  <header className={HOME_HERO.row}>
    <div className={HOME_HERO.words}>
      <h2 className={HOME_HERO.greeting}>{PERSONAL_COPY.greeting.replace('{name}', name)}</h2>
      <p className={HOME_HERO.hello}>{PERSONAL_COPY.hello}</p>
    </div>
    <time className={HOME_HERO.date} dateTime={new Date().toISOString().slice(0, 10)}>
      {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
    </time>
  </header>
)
