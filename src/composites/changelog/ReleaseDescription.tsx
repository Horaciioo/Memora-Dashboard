import { CountUp } from '@/components/elements/display/CountUp'
import { Section } from '@/components/structures/Section'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { releaseCategories } from '@/declarations/changelog/helpers'
import { CHANGELOG_TAGS } from '@/declarations/changelog/releases'
import type { ChangelogRelease } from '@/declarations/changelog/releases'
import { CHANGELOG_BOARD } from '@/declarations/ui/blocks'
import { TONES } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'

export interface ReleaseDescriptionProps {
  release: ChangelogRelease
}

/**
 * Description box: the lead, why the changes were made, then what each category holds
 * @param {ReleaseDescriptionProps} props - Note
 * @return {JSX.Element}
 */

export const ReleaseDescription = ({ release }: ReleaseDescriptionProps) => (
  <Section title={CHANGELOG_COPY.descriptionTitle} padded>
    <div className={CHANGELOG_BOARD.descriptionBody}>
      <p className={CHANGELOG_BOARD.lead}>{release.intro}</p>
      <p className={CHANGELOG_BOARD.description}>{release.description}</p>
      <div className={CHANGELOG_BOARD.rule} aria-hidden="true" />
      <dl className={CHANGELOG_BOARD.figures}>
        {releaseCategories(release).map(({ tag, items }) => (
          <div key={tag} className={CHANGELOG_BOARD.figure}>
            <dt className={CHANGELOG_BOARD.figureLabel}>{CHANGELOG_TAGS[tag].heading}</dt>
            <dd className={cn(CHANGELOG_BOARD.figureValue, TONES[CHANGELOG_TAGS[tag].tone].text)}>
              <CountUp value={items.length} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </Section>
)
